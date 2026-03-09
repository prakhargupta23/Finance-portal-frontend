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
	gmMatched: boolean;
	sanctionedCost?: string;
	division?: string;
	allocation?: string;
	hasData: boolean;
	totalWorks: number;
	// NWR LOOPS
	nwrLoopCount: number;
	nwrLoops: {
		cepdDate: string;
		faDate: string;
		delayDays: number;
	}[];
	//   NWR LOOPS END
	firstDesignationDate?: string;
	gmApprovalDateFormatted?: string;
	lastDesignationDate?: string;
	srdfmLastDate?: string;
	drmLastDate?: string;
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
		return date.toLocaleDateString("en-GB"); // Using en-GB for DD/MM/YYYY
	}
	return raw;
};

// << VISUAL REFINEMENT START >>
// Purpose: Convert messy OCR strings (e.g., "29-Road Safety") into clean labels like "PH-29".
// This is purely visual and does not change the background logic.
const formatPlanHeadDisplay = (value: string): string => {
	if (!value) return "";
	let cleaned = value.toUpperCase();

	// Strip common junk prefixes instead of failing
	cleaned = cleaned.replace(/PLAN HEAD[:\s]*/g, "");
	cleaned = cleaned.replace(/HEAD[:\s]*/g, "");
	cleaned = cleaned.replace(/[^A-Z0-9-\s]/g, ""); // Remove crazy symbols
	cleaned = cleaned.trim();

	if (!cleaned || cleaned === "-" || cleaned === "NULL") return "";

	// Try to find the numeric part for "PH-XX" formatting
	const match = cleaned.match(/\d+/);
	if (match) {
		return `PH-${match[0]}`;
	}

	return cleaned;
};
// << VISUAL REFINEMENT END >>

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
	const gmMatched = Boolean(payload?.gmMatched ?? payload?.meta?.gmMatched);
	const sanctionedCost = payload?.meta?.sanctioned_cost ?? payload?.sanctioned_cost;
	const division = payload?.meta?.division ?? payload?.division;
	const allocation = payload?.meta?.allocation ?? payload?.allocation;
	const totalWorks = toNumber(payload?.totalWorks ?? 1);

	if (apiTotal) hasData = true;
	// NWR LOOPS
	const nwrLoops = payload?.nwrLoops ?? delayRoot?.nwrLoops ?? [];
	const nwrLoopCount = payload?.nwrLoopCount ?? delayRoot?.nwrLoopCount ?? nwrLoops.length;

	const markers = payload?.markers ?? delayRoot?.markers ?? {};

	return {
		divisionExec,
		divisionFinance,
		hqExec,
		totalCycleDays,
		gmApprovalDate,
		gmMatched,
		sanctionedCost,
		division,
		allocation,
		hasData,
		totalWorks,
		nwrLoopCount,
		nwrLoops,
		firstDesignationDate: markers.firstDesignationDate || formatDate(markers.firstDesignationAt),
		gmApprovalDateFormatted: markers.gmApprovalDateFormatted || formatDate(markers.gmApprovalAt),
		lastDesignationDate: markers.lastDesignationDate || formatDate(markers.lastDesignationAt),
		srdfmLastDate: markers.srdfmLastDate || formatDate(markers.srdfmLastAt),
		drmLastDate: markers.drmLastDate || formatDate(markers.drmLastAt),
	};
};

const VettingDelayPage: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
	const workname = params.get("work")?.trim() ?? "";
	const planHead = params.get("planHead")?.trim() ?? "";
	const sNo = params.get("sNo")?.trim() ?? "";

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>(undefined);
	const [delayView, setDelayView] = useState<DelayView | undefined>(undefined);

	const workTitle = (workname || "PROJECT INITIATION").toUpperCase();

	const timelineRows = [
		{
			id: "initiation",
			title: "PROJECT INITIATION",
			badge: "FIELD UNIT",
			actioned: delayView?.gmMatched ? "Actioned by GM" : undefined,
			rightLabel: "PHASE",
			rightValue: delayView?.gmApprovalDateFormatted || "START",
			active: false,
		},
		{
			id: "division-finance",
			// title: "ASSOCIATE FINANCE VETTING",
			title: "Project Initiation on IRPSM",
			badge: "DIVISION FINANCE",
			actioned: delayView?.firstDesignationDate ? `First Designation ${delayView.firstDesignationDate}` : "Actioned by First Designation",
			rightLabel: "TIME TAKEN BY DIVISION EXECUTIVE",
			rightValue: `${delayView?.divisionExec ?? 0} Days 0h`,
			active: false,
		},
		// actioned: delayView?.firstDesignationDate ? `Actioned by Sr.DFM/DNR on ${delayView.firstDesignationDate}` : "Actioned by Sr.DFM/DNR",
		{
			id: "hq-executive",
			title: "HQ EXECUTIVE SANCTION",
			badge: "ZONAL HQ",
			actioned: (delayView?.srdfmLastDate || delayView?.drmLastDate)
				? `Sr.DFM: ${delayView.srdfmLastDate || "--"} | DRM: ${delayView.drmLastDate || "--"}`
				: "Actioned by PC/E/CR",
			rightLabel: "TIME TAKEN BY DIVISION FINANCE",
			rightValue: `${delayView?.divisionFinance ?? 0} Days 0h`,
			active: false,
		},

		{
			id: "NWR-loop",
			title: "HQ finance",
			badge: "NWR",
			rightLabel: `${delayView?.nwrLoopCount ?? 0} Cycles`,
			active: false,
		},
		{
			id: "hq-finance",
			// title: "HQ FINANCE SCRUTINY",
			title: "Process after Finance Concurrence",
			badge: "HQ FINANCE",
			actioned: delayView?.lastDesignationDate ? `Last Designation ${delayView.lastDesignationDate}` : undefined,
			rightLabel: "TIME TAKEN BY ZONAL EXECUTIVE",
			rightValue: `${delayView?.hqExec ?? 0} Days 0h`,
			active: true,
		},
	];
	// actioned: delayView?.lastDesignationDate ? `Final Vetting signature on ${delayView.lastDesignationDate}` : undefined,
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
				const payload = await vettingService.getVettingDelay({
					planHead,
					workname,
					sNo
				});
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
	}, [planHead, workname, sNo]);

	return (
		<div style={{ minHeight: '100vh', background: '#f1f5f9', padding: '48px 24px', fontFamily: '"Inter", sans-serif' }}>
			<style>{`
				.st-dd-container { max-width: 1000px; margin: 0 auto; }
				.st-dd-nav-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
				.st-back-pill { background: #fff; border: 1px solid #e2e8f0; padding: 10px 24px; border-radius: 999px; color: #475569; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
				.st-back-pill:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; transform: translateY(-1px); }
				.st-top-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 32px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); margin-bottom: 24px; }
				.st-project-headline { font-size: 22px; font-weight: 800; color: #0f172a; line-height: 1.4; border-bottom: 2px solid #f8fafc; padding-bottom: 20px; margin-bottom: 24px; }
				.st-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 24px; }
				.st-stat-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
				.st-stat-value { font-size: 18px; font-weight: 700; color: #1e293b; }
				.st-stat-value.hero { color: #2563eb; }
				.st-track-shell { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.04); }
				.st-track-title-card { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f8fafc; padding-bottom: 24px; margin-bottom: 40px; }
				.st-cycle-summary { background: #f0f9ff; border: 1px solid #e0f2fe; padding: 12px 24px; border-radius: 12px; text-align: right; }
				.st-cycle-summary-label { font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase; margin-bottom: 4px; }
				.st-cycle-summary-val { font-size: 24px; font-weight: 900; color: #075985; }
				.st-step-row { position: relative; padding-left: 48px; margin-bottom: 40px; }
				.st-step-row:last-child { margin-bottom: 0; }
				.st-step-connector { position: absolute; left: 19px; top: 24px; bottom: -44px; width: 2px; background: #e2e8f0; }
				.st-step-row:last-child .st-step-connector { display: none; }
				.st-step-indicator { position: absolute; left: 12px; top: 4px; width: 16px; height: 16px; background: #2563eb; border: 4px solid #fff; border-radius: 50%; box-shadow: 0 0 0 1px #2563eb; z-index: 2; }
				.st-step-content { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 24px; transition: transform 0.2s; }
				.st-step-content:hover { border-color: #dbeafe; transform: scale(1.01); }
				.st-step-tag { background: #fff; border: 1px solid #e2e8f0; color: #475569; padding: 4px 12px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
				.st-step-desc { font-size: 14px; font-weight: 500; color: #64748b; margin-top: 12px; }
				.st-step-large-val { font-size: 20px; font-weight: 800; color: #0f172a; }
			`}</style>

			<div className="st-dd-container">
				<div className="st-dd-nav-row">
					<button className="st-back-pill" onClick={() => navigate("/vetting")}>← Back to Vetting Dashboard</button>
				</div>

				<div className="st-top-card">
					<div className="st-project-headline">{workTitle}</div>
					<div className="st-stat-grid">
						<div>
							<div className="st-stat-label">Sanctioned Cost & Div</div>
							<div className="st-stat-value">
								{delayView?.sanctionedCost || "--"}
								<span style={{ fontSize: '13px', color: '#94a3b8', marginLeft: '8px' }}>({delayView?.division || "HQ"})</span>
							</div>
						</div>
						<div>
							<div className="st-stat-label">Budget Allocation</div>
							<div className="st-stat-value">{delayView?.allocation || "N/A"}</div>
						</div>
						<div>
							<div className="st-stat-label">Plan Head</div>
							<div className="st-stat-value hero">{formatPlanHeadDisplay(planHead) || "PH-XX"}</div>
						</div>
						<div>
							<div className="st-stat-label">GM Review Status</div>
							<div className={`st-stat-value ${!delayView?.gmMatched ? 'st-error-text' : ''}`}>
								{delayView?.gmMatched ? (delayView.gmApprovalDate || "Verified") : "⚠️ GM DATE NOT MATCHED"}
							</div>
						</div>
					</div>
				</div>

				<div className="st-track-shell">
					<div className="st-track-title-card">
						<div>
							<div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a' }}>ADMINISTRATIVE VELOCITY TRACK</div>
						</div>
						<div className="st-cycle-summary">
							<div className="st-cycle-summary-label">Total Cycle Time</div>
							<div className="st-cycle-summary-val">{(delayView?.totalCycleDays ?? 0)} Days</div>
						</div>
					</div>

					{loading && <div style={{ color: '#94a3b8', textAlign: 'center', padding: '60px 0' }}>Analyzing vetting cycles...</div>}
					{error && <div style={{ color: '#b91c1c', background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '1px solid #fecaca', fontWeight: 600 }}>{error}</div>}

					{!loading && !error && delayView && (
						<div style={{ marginTop: '20px' }}>
							{timelineRows.map((row) => (
								<div key={row.id} className="st-step-row">
									<div className="st-step-connector" />
									<div className="st-step-indicator" />
									<div className="st-step-content">
										{row.id === "NWR-loop" && delayView?.nwrLoops?.length > 0 && (
											<div style={{ background: '#fff', border: '1px solid #edf2f7', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
												{delayView.nwrLoops.map((loop, index) => (
													<div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: index < delayView.nwrLoops.length - 1 ? '12px' : 0 }}>
														<span style={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}>Cycle {index + 1}</span>
														<span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
															{new Date(loop.cepdDate).toLocaleDateString("en-GB")} → {new Date(loop.faDate).toLocaleDateString("en-GB")}
														</span>
														<span style={{
															fontSize: '13px',
															fontWeight: 900,
															color: loop.delayDays > 7 ? '#dc2626' : '#16a34a',
															background: loop.delayDays > 7 ? '#fef2f2' : '#f0fdf4',
															padding: '2px 10px',
															borderRadius: '6px'
														}}>{loop.delayDays} Days</span>
													</div>
												))}
											</div>
										)}
										<div style={{ display: 'flex', justifyContent: 'space-between' }}>
											<div style={{ flex: 1 }}>
												<div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
													<div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>{row.title}</div>
													<div className="st-step-tag">{row.badge}</div>
												</div>
												<div className="st-step-desc">{row.actioned}</div>
											</div>
											<div style={{ textAlign: 'right', minWidth: '140px' }}>
												<div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>{row.rightLabel}</div>
												<div className="st-step-large-val">{row.rightValue}</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default VettingDelayPage;



