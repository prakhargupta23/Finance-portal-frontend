import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/dashboard.css";
import { vettingService } from "../services/vetting.service";

type DelayView = {
	divisionExec: number;
	divisionFinance: number;
	hqExec: number;
	totalCycleDays: number;
	gmApprovalDate?: string;
	hasData: boolean;
};

const toNumber = (value: any) => {
	const parsed = Number(value ?? 0);
	return Number.isFinite(parsed) ? parsed : 0;
};

const formatDate = (value: any) => {
	if (!value) return undefined;
	const raw = String(value).trim();
	if (!raw) return undefined;
	const date = new Date(raw);
	if (!Number.isNaN(date.getTime())) {
		return date.toLocaleDateString("en-US");
	}
	return raw;
};

const pickGmApprovalDate = (payload: any, delayRoot: any) => {
	const candidates = [
		payload?.gmapprovaldate,
		payload?.gmApprovalDate,
		payload?.gm_approval_date,
		payload?.vettingData?.gmapprovaldate,
		payload?.vettingData?.gmApprovalDate,
		payload?.vettingData?.docdata?.[0]?.gmapprovaldate,
		payload?.vettingData?.docdata?.[0]?.gmApprovalDate,
		delayRoot?.gmapprovaldate,
		delayRoot?.gmApprovalDate,
	];
	for (const value of candidates) {
		const formatted = formatDate(value);
		if (formatted) return formatted;
	}
	return undefined;
};

const extractDelayView = (payload: any): DelayView => {
	const delayRoot = payload?.vettingData?.delayData ?? payload?.delayData ?? payload ?? {};
	const sumByBucket: Record<string, number> = {};
	let hasData = false;

	const addDelay = (bucket: any, days: any) => {
		const key = String(bucket || "").toUpperCase().trim();
		if (!key) return;
		hasData = true;
		sumByBucket[key] = (sumByBucket[key] || 0) + toNumber(days);
	};

	const fromDelayObj = (delayObj: any) => {
		addDelay("DIVISION_EXECUTIVE", delayObj?.executiveDelayDays);
		addDelay("DIVISION_FINANCE", delayObj?.financeDelayDays);
		addDelay("HQ_EXECUTIVE", delayObj?.hqDelayDays);
	};

	if (Array.isArray(delayRoot)) {
		delayRoot.forEach((row: any) => {
			addDelay(row?.bucket ?? row?.delayBucket ?? row?.stage ?? row?.name, row?.delayDays ?? row?.days ?? row?.value);
		});
	} else if (delayRoot && typeof delayRoot === "object") {
		if (delayRoot.delays && typeof delayRoot.delays === "object") {
			fromDelayObj(delayRoot.delays);
		}

		fromDelayObj(delayRoot);

		if (delayRoot.buckets && typeof delayRoot.buckets === "object") {
			Object.entries(delayRoot.buckets).forEach(([bucket, value]: [string, any]) => {
				addDelay(bucket, value?.delayDays ?? value?.days ?? value?.value ?? value);
			});
		}

		Object.entries(delayRoot).forEach(([k, v]: [string, any]) => {
			if (Array.isArray(v)) {
				v.forEach((row: any) => addDelay(row?.bucket ?? k, row?.delayDays ?? row?.days ?? row?.value));
			}
		});
	}

	const pick = (keys: string[]) => keys.reduce((total, key) => total + toNumber(sumByBucket[key] || 0), 0);

	const divisionExec = pick(["DIVISION_EXECUTIVE", "EXECUTIVE"]);
	const divisionFinance = pick(["DIVISION_FINANCE", "FINANCE"]);
	const hqExec = pick(["HQ_EXECUTIVE", "HQ"]);
	const apiTotal = toNumber(payload?.totalCycleDays ?? delayRoot?.totalCycleDays ?? delayRoot?.totalDays);
	const totalCycleDays = apiTotal || divisionExec + divisionFinance + hqExec;
	const gmApprovalDate = pickGmApprovalDate(payload, delayRoot);
	if (apiTotal) hasData = true;

	return { divisionExec, divisionFinance, hqExec, totalCycleDays, gmApprovalDate, hasData };
};

const VettingDelayPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const workname = params.get("work")?.trim() ?? "";
	const planHead = params.get("planHead")?.trim() ?? "";

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [delayView, setDelayView] = useState<DelayView | undefined>(undefined);

	const workTitle = (workname || "PROJECT INITIATION").toUpperCase();
	// const gmDate = delayView?.gmApprovalDate ?? "--";

	const timelineRows = [
		{
			id: "initiation",
			title: "PROJECT INITIATION",
			badge: "FIELD UNIT",
			// actioned: "Actioned by GM",
			rightLabel: "PHASE",
			rightValue: "START",
			active: false,
		},
		{
			id: "division-finance",
			title: "ASSOCIATE FINANCE VETTING",
			badge: "DIVISION FINANCE",
			actioned: "Actioned by Sr.DFM/DNR",
			rightLabel: "TIME TAKEN BY DIVISION EXECUTIVE",
			rightValue: `${delayView?.divisionExec ?? 0} Days 0h`,
			active: false,
		},
		{
			id: "hq-executive",
			title: "HQ EXECUTIVE SANCTION",
			badge: "ZONAL HQ",
			// actioned: "Actioned by PC/E/CR",
			rightLabel: "TIME TAKEN BY DIVISION FINANCE",
			rightValue: `${delayView?.divisionFinance ?? 0} Days 0h`,
			active: false,
		},
		{
			id: "hq-finance",
			title: "HQ FINANCE SCRUTINY",
			badge: "HQ FINANCE",
			// actioned: "Actioned by AD/FINANCE",
			rightLabel: "TIME TAKEN BY ZONAL EXECUTIVE",
			rightValue: `${delayView?.hqExec ?? 0} Days 0h`,
			active: true,
		},
	];

	useEffect(() => {
		if (!workname || !planHead) {
			setError("Missing work or plan head in URL.");
			setDelayView(undefined);
			return;
		}

		void (async () => {
			try {
				setLoading(true);
				setError(undefined);
				const payload = await vettingService.getVettingDelay({ planHead, workname });
				const parsed = extractDelayView(payload);
				if (!parsed.hasData) {
					setError("No delay-deviation data found for this work.");
					setDelayView(undefined);
					return;
				}
				setDelayView(parsed);
			} catch (e: any) {
				setError(e?.message ?? "Failed to load delay deviation.");
				setDelayView(undefined);
			} finally {
				setLoading(false);
			}
		})();
	}, [planHead, workname]);

	return (
		<div className="scrutiny-root st-dd-page">
			<div className="st-dd-shell">
				<div className="st-dd-top-card">
					<div className="st-dd-top-left">
						<div className="st-dd-main-title">{workTitle}</div>
						<div className="st-dd-kv-row">
							<div>
								<div className="st-dd-k">ASSET VALUATION</div>
								<div className="st-dd-v">18,50,00,000</div>
							</div>
							<div>
								<div className="st-dd-k">BUDGET ALLOCATION</div>
								<div className="st-dd-v">{planHead || "PH-11 (New Lines)"}</div>
							</div>
						</div>
					</div>
					<div className="st-dd-metrics">
						<div className="st-dd-metric">
							<div className="st-dd-metric-val">78%</div>
							<div className="st-dd-metric-lbl">COMPLIANCE</div>
						</div>
						<div className="st-dd-metric">
							<div className="st-dd-metric-val st-dd-metric-green">82%</div>
							<div className="st-dd-metric-lbl">JUSTIFICATION</div>
						</div>
					</div>
				</div>

				<div className="st-dd-content-grid">
					<div className="st-dd-track">
						<div className="st-dd-track-head">
							<div>
								<div className="st-dd-track-title">ADMINISTRATIVE VELOCITY TRACK</div>
								<div className="st-dd-track-sub">TOTAL CYCLE TIME: {(delayView?.totalCycleDays ?? 0)} DAYS 0H</div>
							</div>
						</div>

						{loading && <div className="st-muted">Loading delay data...</div>}
						{error && <div className="st-tag st-error-text">{error}</div>}

						{!loading && !error && delayView && (
							<div className="st-dd-timeline-wrap">
								{timelineRows.map((row) => (
									<div key={row.id} className={`st-dd-step ${row.active ? "active" : ""}`}>
										<div className="st-dd-step-dot" aria-hidden />
										<div className="st-dd-step-card">
											<div className="st-dd-step-top">
												<div className="st-dd-step-title">{row.title}</div>
												<div className="st-dd-step-right-label">{row.rightLabel}</div>
											</div>
											<div className="st-dd-step-mid">
												<div>
													<span className="st-dd-step-badge">{row.badge}</span>
													<div className="st-dd-step-action">{row.actioned}</div>
												</div>
												<div className="st-dd-step-right-value">{row.rightValue}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}

						<div className="st-dd-performance">
							<div className="st-dd-performance-title">PERFORMANCE ANALYTICS (PH-HEAD WEIGHTED)</div>
							<div className="st-dd-performance-grid">
								<div>
									<div className="st-dd-performance-k">DIVISION HANDLING EFFICIENCY</div>
									<div className="st-dd-performance-v green">OPTIMAL</div>
								</div>
								<div>
									<div className="st-dd-performance-k">SCRUTINY RESILIENCE</div>
									<div className="st-dd-performance-v">STABLE</div>
								</div>
							</div>
						</div>
					</div>

					<div>
						<div className="st-dd-side-top-action">
							<button className="st-btn" onClick={() => navigate("/vetting")}>Back to Vetting</button>
						</div>

						<div className="st-dd-side-card">
							<div className="st-dd-side-title">VETTING ACTION PANEL</div>
							<textarea className="st-textarea" placeholder="Record official remarks..." rows={4} />
							<div className="st-dd-side-actions">
								<button type="button" className="st-btn st-btn-primary">FORWARD FOR CONCURRENCE</button>
								<button type="button" className="st-btn st-dd-outline-btn">RETURN FOR REVISION</button>
							</div>
						</div>

						<div className="st-dd-side-card">
							<div className="st-dd-side-title">QUALITATIVE HEALTH</div>
							<ul className="st-tags st-dd-health">
								<li className="st-tag st-tag-green">High urgency</li>
								<li className="st-tag st-tag-green">Clear ROI</li>
							</ul>
						</div>
					</div>
				</div>


			</div>
		</div>
	);
};

export default VettingDelayPage;





