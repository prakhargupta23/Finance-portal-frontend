import React, { useEffect, useMemo, useState } from "react";
import "../css/dashboard.css";
import { vettingService } from "../services/vetting.service";
import { useNavigate } from "react-router-dom";


type TimelineItem = {
	title: string;
	actor: string;
	date: string;
	summary: string;
	timeTaken?: string;
	phase?: string;
};

type WorkListItem = {
	workname: string;
	planhead: string;
	s_no: string;
};

// << VISUAL REFINEMENT START >>
// Purpose: Convert messy OCR strings into clean labels like "PH-29" by stripping junk prefixes.
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

// Helper: Strip common OCR junk from work names in the list view
const normalizeWorkName = (name: string): string => {
	if (!name) return "";
	let cleaned = name.trim();
	// Remove common OCR prefixes
	cleaned = cleaned.replace(/^(WORK NAME\s*[:]\s*|View Full Screen\s*—\s*)+/gi, "");
	return cleaned;
};
// << VISUAL REFINEMENT END >>


const Card: React.FC<{ title?: string; right?: React.ReactNode; children?: React.ReactNode }> = ({
	title,
	right,
	children,
}) => (
	<div className="st-card">
		{(title || right) && (
			<div className="st-card-head">
				{title && <h3>{title}</h3>}
				{right && <div className="st-card-right">{right}</div>}
			</div>
		)}
		<div className="st-card-body">{children}</div>
	</div>
);

const ControlHub: React.FC<{
	planHeads: string[];
	selectedPlanHead: string;
	onSelectPlanHead: (ph: string) => void;
	analytics: { works: number; avgDays: string };
	bucketDays?: { divisionExec?: number; divisionFinance?: number; hqExec?: number };
}> = ({
	planHeads,
	selectedPlanHead,
	onSelectPlanHead,
	analytics,
	bucketDays,
}) => {

		const [pendingPH, setPendingPH] = useState<string>(selectedPlanHead);
		useEffect(() => {
			setPendingPH(selectedPlanHead);
		}, [selectedPlanHead]);

		return (
			<section>
				<div className="st-header-row">
					<h2 className="st-section-title">CONTROL HUB</h2>

					<div className="st-header-actions">
						<button className="st-btn st-btn-primary">+ AUDIT NEW PROPOSAL</button>
					</div>

				</div>

				<div className="st-grid st-grid-2">
					<Card title="PLAN HEAD THROUGHPUT ANALYTICS">
						<div className="st-analytics">
							<div>
								<div className="st-kv">

									<span className="st-k">{selectedPlanHead || "PLAN HEAD"}</span>
									<span className="st-v">{analytics.works} WORKS</span>
								</div>
								<div className="st-kv">
									<span className="st-k">PIPELINE VALUE</span>
									<span className="st-v">{currency(analytics.pipelineValue || "-")}</span>
								</div>
								<div className="st-kv">
									<span className="st-k">AVG. VETTING TIME</span>
									<span className="st-v">{analytics.avgDays}</span>
								</div>
								<div className="st-kv" style={{ marginTop: 8 }}>
									<span className="st-k">Select Plan Head</span>
									<span className="st-v">
										<select className="st-select" value={pendingPH} onChange={(e) => setPendingPH(e.target.value)}>
											{planHeads.map((ph) => (
												<option key={ph} value={ph}>{ph}</option>
											))}
										</select>
										<button className="st-btn" style={{ marginLeft: 8 }} onClick={() => onSelectPlanHead(pendingPH)}>Set</button>

									<span className="st-k" style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
										PLAN HEAD: <span style={{ color: '#0b5fff', marginLeft: '4px' }}>{formatPlanHeadDisplay(selectedPlanHead) || "--"}</span>
									</span>
									<span className="st-v">{analytics.works} WORKS</span>
								</div>
								<div className="st-kv">
									<span className="st-k">TOTAL(AVG. VETTING DAYS)</span>
									<span className="st-v">{analytics.avgDays}</span>
								</div>
								<div className="st-kv" style={{ marginTop: 8 }}>
									<span className="st-k">SELECT PLAN HEAD</span>
									<span className="st-v">
										<select
											className="st-select"
											value={selectedPlanHead}
											onChange={(e) => onSelectPlanHead(e.target.value)}
										>
											{planHeads
												.filter(ph => formatPlanHeadDisplay(ph) !== "")
												.map((ph) => (
													<option key={ph} value={ph}>{formatPlanHeadDisplay(ph)}</option>
												))}
										</select>

									</span>
								</div>
							</div>
						</div>
					</Card>

					<Card>
						<div className="st-proposal">
							<div className="st-prop-head">

								<div className="st-prop-scope">AVG. VETTING DAYS</div>

							</div>
							<AvgDelayBoxes bucketDays={bucketDays} />
						</div>
					</Card>
				</div>
			</section>
		);
	};

const AdministrativeVelocity: React.FC<{
	works: WorkListItem[];
	selectedPlanHead: string;
	onOpenDelayForWork: (workname: string, planHead: string, sNo?: string) => void;
}> = ({ works, selectedPlanHead, onOpenDelayForWork }) => {

	return (
		<div>
			<div className="st-worklist-wrap">
				<div className="st-worklist-title">WORKS IN {formatPlanHeadDisplay(selectedPlanHead) || "SELECTED PLAN HEAD"}</div>
				{works.length ? (
					<div className="st-worklist">
						{works.map((work) => (
							<div className="st-worklist-row" key={`${work.planhead}-${work.workname}`}>
								<button
									className="st-workname-link"
									type="button"
									onClick={() => onOpenDelayForWork(work.workname, work.planhead, work.s_no)}
								>
									{normalizeWorkName(work.workname)}
								</button>
								<button
									className="st-btn st-btn-primary st-worklist-btn"
									type="button"
									onClick={() => onOpenDelayForWork(work.workname, work.planhead, work.s_no)}
								>
									View Delay
								</button>
							</div>
						))}
					</div>
				) : (
					<div className="st-muted">No works available for this plan head.</div>
				)}
			</div>
		</div>
	);
};

const AvgDelayBoxes: React.FC<{ bucketDays?: { divisionExec?: number; divisionFinance?: number; hqExec?: number } }> = ({ bucketDays }) => {
	return (
		<div>
			<div className="st-velocity-pillars">
				<div className="st-pillar">
					<div className="st-pillar-title">DIVISION EXECUTIVE</div>
					<div className="st-pillar-value">{bucketDays?.divisionExec ?? 0} DAYS</div>
				</div>
				<div className="st-pillar">
					<div className="st-pillar-title">DIVISION FINANCE</div>
					<div className="st-pillar-value">{bucketDays?.divisionFinance ?? 0} DAYS</div>
				</div>
				<div className="st-pillar">
					<div className="st-pillar-title">ZONAL EXECUTIVE</div>
					<div className="st-pillar-value">{bucketDays?.hqExec ?? 0} DAYS</div>
				</div>
			</div>
		</div>
	);
};
const Ingestion: React.FC<{ onFetch: (data: any) => void; loading: boolean; fetchedPreview?: string; error?: string }> = ({ onFetch, loading, fetchedPreview, error }) => {
	const [fileName, setFileName] = useState<string>("");
	return (
		<div className="st-ingestion">
			<Card title="HQ VETTING INGESTION">
				<div className="st-dropzone">
					<input
						type="file"
						id="ingestion-file"
						className="st-dropzone-input"
						onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
					/>
					<label htmlFor="ingestion-file" className="st-dropzone-label">
						<div className="st-drop-icon" aria-hidden>⬆</div>
						<div className="st-drop-text">Drop Approved Notesheets</div>
						<div className="st-drop-sub">EXECUTIVE AUDIT HASH REQUIRED</div>
					</label>
				</div>
				<div className="st-actions">
					<button className="st-btn st-btn-primary" onClick={() => onFetch(fileName)} disabled={loading}>
						{loading ? "Initializing..." : "INITIALIZE SCRUTINY ENGINE"}
					</button>
				</div>
				{fetchedPreview && (
					<div className="st-kv" style={{ marginTop: 10 }}>
						<span className="st-k">Fetched</span>
						<span className="st-v">{fetchedPreview}</span>
					</div>
				)}
				{error && <div className="st-tag" style={{ marginTop: 10, color: "#b91c1c", borderColor: "#fecaca", background: "#fef2f2" }}>{error}</div>}
			</Card>
		</div>
	);
};

const Vetting: React.FC = () => {
	const [page] = useState<"dashboard" | "ingestion">("dashboard");
	const [loading, setLoading] = useState(false);
	const [vettingData, setVettingData] = useState<any>(null);
	const [error, setError] = useState<string | undefined>(undefined);
	const navigate = useNavigate();
	const [planHeads, setPlanHeads] = useState<string[]>(["PH-11 (NEW LINES)"]);
	const [selectedPlanHead, setSelectedPlanHead] = useState<string>(localStorage.getItem("selectedPlanHead") || "PH-11 (NEW LINES)");
	const [analytics, setAnalytics] = useState<{ works: number; avgDays: string }>({ works: 1, avgDays: "22.0 DAYS" });
	const [currentWorkName, setCurrentWorkName] = useState<string | undefined>(undefined);

	// const [selectedPlanEntry, setSelectedPlanEntry] = useState<any>(undefined);
	const [timelineData, setTimelineData] = useState<TimelineItem[] | undefined>(undefined);
	const [qualitativeTags, setQualitativeTags] = useState<string[] | undefined>(undefined);
	const [cycleDays, setCycleDays] = useState<number | undefined>(undefined);

	const [bucketDays, setBucketDays] = useState<{ divisionExec?: number; divisionFinance?: number; hqExec?: number } | undefined>(undefined);
	const avgVettingSumDays = useMemo(() => {
		if (!bucketDays) return undefined;
		console.log(timelineData, qualitativeTags, cycleDays)
		const divisionExec = Number(bucketDays.divisionExec ?? 0);
		const divisionFinance = Number(bucketDays.divisionFinance ?? 0);
		const hqExec = Number(bucketDays.hqExec ?? 0);
		return Math.max(0, Math.round(divisionExec + divisionFinance + hqExec));
	}, [bucketDays]);
	const velocityBucketOrder = ["DIVISION_EXECUTIVE", "DIVISION_FINANCE", "HQ_EXECUTIVE"] as const;
	const worksForSelectedPlanHead = useMemo<WorkListItem[]>(() => {
		const docs: any[] = vettingData?.vettingData?.docdata ?? [];
		return docs
			.filter((doc) => String(doc.planhead) === String(selectedPlanHead))
			.map((doc) => ({
				workname: String(doc.workname || "").trim(),
				planhead: String(doc.planhead || "").trim(),
				s_no: doc.s_no
			}))
			.filter((work) => work.workname && work.planhead);
	}, [selectedPlanHead, vettingData]);
	const openDelayForWork = (workname: string, planHead: string, sNo?: string) => {
		const query = `work=${encodeURIComponent(workname)}&planHead=${encodeURIComponent(planHead)}${sNo ? `&sNo=${sNo}` : ""}`;
		navigate(`/vetting/delay?${query}`);
	};

	const buildVelocityFromBucketSums = (sumByBucket: Record<string, number>, worksCount: number) => {
		const divisor = worksCount > 0 ? worksCount : 1;
		const avgByBucket: Record<string, number> = {};
		Object.keys(sumByBucket).forEach((k) => {
			avgByBucket[k] = Math.round((Number(sumByBucket[k]) || 0) / divisor);
		});

		const timeline: TimelineItem[] = velocityBucketOrder
			.filter((b) => typeof avgByBucket[b] === "number")
			.map((b) => ({
				title:
					b === "DIVISION_EXECUTIVE"
						? "DIVISION EXECUTIVE HANDLING"
						: b === "DIVISION_FINANCE"

							? "DIVISION EXECUTIVE"

							: "HQ SCRUTINY",
				actor: b.replace("_", " "),
				date: "",
				summary: `Average delay ${avgByBucket[b]} days`,
			}));

		const divisionExec = avgByBucket["DIVISION_EXECUTIVE"] ?? 0;
		const divisionFinance = avgByBucket["DIVISION_FINANCE"];
		const hqExec = avgByBucket["HQ_EXECUTIVE"] ?? 0;
		const cycle = Math.max(0, Math.round(divisionExec + (divisionFinance ?? 0) + hqExec));

		return {
			timeline,
			tags: velocityBucketOrder.filter((b) => typeof avgByBucket[b] === "number"),
			cycleDays: cycle,
			bucketDays: {
				divisionExec,
				divisionFinance,
				hqExec,
			},
		};
	};

	const deriveVelocityFromDelayApi = (delayPayload: any, ph: string, docs: any[]) => {
		const selectedDocs = (docs || []).filter((d: any) => String(d.planhead) === String(ph));
		const selectedUuids = new Set(selectedDocs.map((d: any) => String(d.uuid)));
		const delayRoot = delayPayload?.vettingData?.delayData ?? delayPayload?.delayData ?? delayPayload;
		if (!delayRoot) return null;

		const sumByBucket: Record<string, number> = {};
		const addDelay = (bucket: any, days: any) => {
			const b = String(bucket || "").toUpperCase();
			if (!b) return;
			const d = Number(days || 0);
			if (!Number.isFinite(d)) return;
			sumByBucket[b] = (sumByBucket[b] || 0) + d;
		};

		if (Array.isArray(delayRoot)) {
			const rows = delayRoot.filter((r: any) => !r?.planhead || String(r.planhead) === String(ph));
			rows.forEach((r: any) => addDelay(r.bucket ?? r.delayBucket ?? r.stage ?? r.name, r.delayDays ?? r.days ?? r.value));
			const worksCount = selectedDocs.length || rows.length || 1;
			return buildVelocityFromBucketSums(sumByBucket, worksCount);
		}

		if (typeof delayRoot === "object") {
			// Shape: { executiveDelayDays, financeDelayDays, hqDelayDays } - Aggregated root level
			if (delayRoot.executiveDelayDays !== undefined || delayRoot.financeDelayDays !== undefined) {
				addDelay("DIVISION_EXECUTIVE", delayRoot.executiveDelayDays);
				addDelay("DIVISION_FINANCE", delayRoot.financeDelayDays);
				addDelay("HQ_EXECUTIVE", delayRoot.hqDelayDays);

				// IMPORTANT: Backend already sent the average. 
				// Pass divisor 1 to buildVelocityFromBucketSums to avoid double-dividing.
				return buildVelocityFromBucketSums(sumByBucket, 1);
			}

			// Shape: { delays: { executiveDelayDays, financeDelayDays, hqDelayDays } }
			if (delayRoot.delays && typeof delayRoot.delays === "object") {
				addDelay("DIVISION_EXECUTIVE", delayRoot.delays.executiveDelayDays);
				addDelay("DIVISION_FINANCE", delayRoot.delays.financeDelayDays);
				addDelay("HQ_EXECUTIVE", delayRoot.delays.hqDelayDays);
				const worksCount = selectedDocs.length || Number(delayRoot.works || delayRoot.totalWorks || 1);
				return buildVelocityFromBucketSums(sumByBucket, worksCount);
			}

			const entries = Object.entries(delayRoot);
			const looksLikeUuidMap = entries.some(([, v]) => Array.isArray(v));

			if (looksLikeUuidMap) {
				const keys = selectedUuids.size ? Array.from(selectedUuids) : Object.keys(delayRoot);
				keys.forEach((id) => {
					const arr = (delayRoot as any)[id];
					if (!Array.isArray(arr)) return;
					arr.forEach((d: any) => addDelay(d.bucket, d.delayDays));
				});
				const worksCount = selectedDocs.length || keys.length || 1;
				return buildVelocityFromBucketSums(sumByBucket, worksCount);
			}

			const bucketObj =
				delayRoot.buckets && typeof delayRoot.buckets === "object" ? delayRoot.buckets : delayRoot;

			velocityBucketOrder.forEach((b) => {
				const value = bucketObj[b] ?? bucketObj[b.toLowerCase()];
				if (typeof value === "number" || typeof value === "string") addDelay(b, value);
				else if (value && typeof value === "object") addDelay(b, value.delayDays ?? value.days ?? value.value);
			});

			if (!Object.keys(sumByBucket).length) {
				Object.entries(bucketObj).forEach(([k, v]: [string, any]) => {
					if (typeof v === "number" || typeof v === "string") addDelay(k, v);
				});
			}

			const worksCount = selectedDocs.length || Number(delayRoot.works || delayRoot.totalWorks || 1);
			return buildVelocityFromBucketSums(sumByBucket, worksCount);
		}

		return null;
	};

	// Helper: derive metrics and timeline from the provided API shape
	function deriveFromApi(raw: any, ph: string) {
		const docs: any[] = raw?.vettingData?.docdata ?? [];

		const delays: Record<string, { bucket: string; enteredAt: string; exitedAt: string; delayDays: number }[]> =
			raw?.vettingData?.delayData ?? {};

		const filteredDocs = docs.filter((d) => String(d.planhead) === String(ph));
		const uuids = filteredDocs.map((d) => d.uuid);

		const works = filteredDocs.length || 0;

		const avgTotalDelay = (() => {
			if (!uuids.length) return 0;
			let total = 0;
			let count = 0;
			uuids.forEach((id) => {
				const arr = delays[id] || [];
				if (arr.length) {
					const sum = arr.reduce((s, r) => s + Number(r.delayDays || 0), 0);
					total += sum;
					count += 1;
				}
			});
			return count ? Math.round(total / count) : 0;
		})();

		// Aggregate bucket days and totals
		const sumByBucket: Record<string, number> = {};
		let totalSumDays = 0;
		uuids.forEach((id) => {
			const arr = delays[id] || [];
			let workTotal = 0;
			arr.forEach((d) => {
				const dd = Number(d.delayDays || 0);
				sumByBucket[d.bucket] = (sumByBucket[d.bucket] || 0) + dd;
				workTotal += dd;
			});
			totalSumDays += workTotal;
		});

		const avgByBucket: Record<string, number> = {};
		Object.keys(sumByBucket).forEach((k) => {
			avgByBucket[k] = works ? Math.round(sumByBucket[k] / works) : 0;
		});

		const buckets = new Set<string>(Object.keys(avgByBucket));

		// Build a simple bucket-based timeline
		const label = (b: string) =>
			b === "DIVISION_EXECUTIVE"
				? "DIVISION EXECUTIVE HANDLING"
				: b === "DIVISION_FINANCE"

					? "DIVISION EXECUTIVE"

					: b === "HQ_EXECUTIVE"
						? "HQ SCRUTINY"
						: b;
		const order = ["DIVISION_EXECUTIVE", "DIVISION_FINANCE", "HQ_EXECUTIVE"];
		const tl: TimelineItem[] = order
			.filter((b) => buckets.has(b))
			.map((b) => ({
				title: label(b),
				actor: b.replace("_", " "),
				date: "",
				summary: `Average delay ${avgByBucket[b]} days`,
			}));

		return {
			analytics: { works, avgDays: `${avgTotalDelay} DAYS` },
			workName: filteredDocs[0]?.workname,
			timeline: tl,
			tags: Array.from(buckets).length ? Array.from(buckets) : undefined,
			cycleDays: works ? Math.max(0, Math.round(totalSumDays / works)) : 0,
			bucketDays: {
				divisionExec: avgByBucket["DIVISION_EXECUTIVE"] ?? 0,
				divisionFinance: avgByBucket["DIVISION_FINANCE"],
				hqExec: avgByBucket["HQ_EXECUTIVE"] ?? 0,
			},
		};
	}

	// This effect is intended to run only once on mount to initialize dashboard data.
	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => {
		(async () => {
			try {
				const data = await vettingService.getVettingData();
				setVettingData(data);
				// Derive plan heads from API (docdata.planhead)
				const phs: string[] = Array.from(
					new Set(
						(data?.vettingData?.docdata || []).map((x: any) => String(x.planhead)).filter(Boolean)
					)
				);
				setPlanHeads((prev) => (phs.length ? phs : prev));

				const savedPH = localStorage.getItem("selectedPlanHead");
				const chosen = (savedPH && phs.includes(savedPH)) ? savedPH : (phs.length ? phs[0] : "PH-11 (NEW LINES)");

				setSelectedPlanHead(chosen);
				const derived = deriveFromApi(data, chosen);
				setAnalytics(derived.analytics);
				setCurrentWorkName(derived.workName);
				setTimelineData(derived.timeline);
				setQualitativeTags(derived.tags);
				setCycleDays(derived.cycleDays);
				setBucketDays(derived.bucketDays);

				try {
					const delayPayload = await vettingService.getVettingDelay(chosen);
					const delayDerived = deriveVelocityFromDelayApi(
						delayPayload,
						chosen,
						data?.vettingData?.docdata || []
					);
					if (delayDerived) {
						setTimelineData(delayDerived.timeline);
						setQualitativeTags(delayDerived.tags);
						setCycleDays(delayDerived.cycleDays);
						setBucketDays(delayDerived.bucketDays);
					}
				} catch {
					// keep derived fallback from get-vetting-data
				}
			} catch (e) {
				// Silent fallback
			}
		})();
	}, []);

	return (
		<div className="scrutiny-root">
			<header className="st-header">
				<div className="st-header-left">
					<div>
						<div className="st-title">SCRUTINY TERMINAL</div>
						<div className="st-subtitle" style={{ marginBottom: '12px' }}>Vetting Terminal — HQ Finance Audit</div>
						<div style={{ display: 'flex', gap: '8px' }}>
							<button className={`st-tab ${page === "dashboard" ? "active" : ""}`} onClick={() => navigate("/")}>DASHBOARD</button>
							<button className={`st-tab`} onClick={() => navigate("/Upload")}>INGESTION</button>
						</div>
					</div>
				</div>
			</header>

			{page === "dashboard" && (
				<>
					<ControlHub
						planHeads={planHeads}
						selectedPlanHead={selectedPlanHead}
						onSelectPlanHead={(ph) => {
							setSelectedPlanHead(ph);
							localStorage.setItem("selectedPlanHead", ph);
							if (vettingData) {
								const derived = deriveFromApi(vettingData, ph);
								setAnalytics(derived.analytics);
								setCurrentWorkName(derived.workName || currentWorkName);
								setTimelineData(derived.timeline);
								setQualitativeTags(derived.tags);
								setCycleDays(derived.cycleDays);
								setBucketDays(derived.bucketDays);
							}

							void (async () => {
								try {
									const delayPayload = await vettingService.getVettingDelay(ph);
									const delayDerived = deriveVelocityFromDelayApi(
										delayPayload,
										ph,
										vettingData?.vettingData?.docdata || []
									);
									if (delayDerived) {
										setTimelineData(delayDerived.timeline);
										setQualitativeTags(delayDerived.tags);
										setCycleDays(delayDerived.cycleDays);
										setBucketDays(delayDerived.bucketDays);
									}
								} catch {
									// keep already-set fallback from get-vetting-data
								}
							})();
						}}
						analytics={{
							...analytics,
							avgDays: avgVettingSumDays !== undefined ? `${avgVettingSumDays} DAYS` : analytics.avgDays,
						}}
						bucketDays={bucketDays}
					/>

					<Card>
						<div className="st-subtabs">
							<button className="st-subtab active" type="button">DELAY-DEVIATION</button>
						</div>
						<AdministrativeVelocity
							works={worksForSelectedPlanHead}
							selectedPlanHead={selectedPlanHead}
							onOpenDelayForWork={openDelayForWork}
						/>
					</Card>
				</>
			)}

			{page === "ingestion" && (
				<Ingestion
					onFetch={async () => {
						try {
							setLoading(true);
							setError(undefined);
							const data = await vettingService.getVettingData();
							setVettingData(data);
						} catch (e: any) {
							setError(e?.message ?? "Failed to initialize scrutiny");
						} finally {
							setLoading(false);
						}
					}}
					loading={loading}
					fetchedPreview={
						vettingData ?
							(Array.isArray(vettingData) ? `${vettingData.length} items` : `${Object.keys(vettingData).length} fields`) :
							undefined
					}
					error={error}
				/>
			)}

		</div>
	);
};

export default Vetting;
