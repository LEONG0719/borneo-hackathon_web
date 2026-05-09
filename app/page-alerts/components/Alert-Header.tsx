"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import AlertMode from "./Alert-Mode";
import AlertFilter from "./Alert-Filter";
import AlertItem from "./Alert-Item-List";
import AlertItemMap from "./Alert-Item-Map";
import { AlertItemInfo } from "@/app/api/alert/util/types";
import { useAlertsData } from "@/app/api/alert/util/useAlertsData";
import Skeleton from "@/app/components/Skeleton";

const ALERTS_PER_PAGE = 5;
const MALAYSIA_STATE_OPTIONS: { label: string, flag: string }[] = [
    { label: "Johor", flag: "/assets/flag-johor.svg" },
    { label: "Kedah", flag: "/assets/flag-kedah.svg" },
    { label: "Kelantan", flag: "/assets/flag-kelantan.svg" },
    { label: "Kuala Lumpur", flag: "/assets/flag-kuala-lumpur.svg" },
    { label: "Labuan", flag: "/assets/flag-labuan.svg" },
    { label: "Melaka", flag: "/assets/flag-melaka.svg" },
    { label: "Negeri Sembilan", flag: "/assets/flag-negeri-sembilan.svg" },
    { label: "Pahang", flag: "/assets/flag-pahang.svg" },
    { label: "Perak", flag: "/assets/flag-perak.svg" },
    { label: "Perlis", flag: "/assets/flag-perlis.svg" },
    { label: "Pulau Pinang", flag: "/assets/flag-pulau-pinang.svg" },
    { label: "Putrajaya", flag: "/assets/flag-putrajaya.svg" },
    { label: "Sabah", flag: "/assets/flag-sabah.svg" },
    { label: "Sarawak", flag: "/assets/flag-sarawak.svg" },
    { label: "Selangor", flag: "/assets/flag-selangor.svg" },
    { label: "Terengganu", flag: "/assets/flag-terengganu.svg" },
];

export default function AlertHeader() {
    const searchParams = useSearchParams();
    const [activeFilter, setActiveFilter] = useState("all"); // Active Filter State (Default to "All Threats")
    const [activeState, setActiveState] = useState("all");
    const [activeSeverity, setActiveSeverity] = useState("all");
    const [activeTimeOrder, setActiveTimeOrder] = useState("newest");
    const [displayMode, setDisplayMode] = useState("list"); // "List" or "Map" Mode State (Default to "List")
    const [focusedAlert, setFocusedAlert] = useState<AlertItemInfo | null>(null); // Alert to zoom into on map.
    const [currentPage, setCurrentPage] = useState(1);
    const alertRefs = useRef<Map<string, HTMLDivElement>>(new Map()); // Refs for scrolling to alert cards.
    
    const { alerts, isLoading } = useAlertsData();
    const skeletonCards = Array.from({ length: 4 });
    const filteredAlerts = useMemo(() => {
        const nextAlerts = alerts.filter((item) =>
                (activeFilter === "all" ||
                    (activeFilter === "other"
                        ? !["flood", "landslide", "tidal"].includes(item.hazardType)
                        : item.hazardType === activeFilter)) &&
                (activeState === "all" || item.stateName === activeState) &&
                (activeSeverity === "all" || item.severity.toLocaleLowerCase() === activeSeverity)
            );

        nextAlerts.sort((left, right) => {
            const leftTime = new Date(left.createdAt || `${left.date}T${left.time}`).getTime();
            const rightTime = new Date(right.createdAt || `${right.date}T${right.time}`).getTime();
            const safeLeftTime = Number.isNaN(leftTime) ? 0 : leftTime;
            const safeRightTime = Number.isNaN(rightTime) ? 0 : rightTime;

            return activeTimeOrder === "oldest"
                ? safeLeftTime - safeRightTime
                : safeRightTime - safeLeftTime;
        });

        return nextAlerts;
    }, [activeFilter, activeSeverity, activeState, activeTimeOrder, alerts]);
    const totalPages = Math.max(1, Math.ceil(filteredAlerts.length / ALERTS_PER_PAGE));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const paginatedAlerts = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * ALERTS_PER_PAGE;
        return filteredAlerts.slice(startIndex, startIndex + ALERTS_PER_PAGE);
    }, [filteredAlerts, safeCurrentPage]);
    const visiblePages = useMemo(() => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        const startPage = Math.max(1, Math.min(safeCurrentPage - 2, totalPages - 4));
        return Array.from({ length: 5 }, (_, index) => startPage + index);
    }, [safeCurrentPage, totalPages]);
    const handleFilterChange = (value: string) => {
        setActiveFilter(value);
        setCurrentPage(1);
    };
    const handleStateChange = (value: string) => {
        setActiveState(value);
        setCurrentPage(1);
    };
    const handleSeverityChange = (value: string) => {
        setActiveSeverity(value);
        setCurrentPage(1);
    };
    const handleTimeOrderChange = (value: string) => {
        setActiveTimeOrder(value);
        setCurrentPage(1);
    };
    const handleResetFilters = () => {
        setActiveFilter("all");
        setActiveState("all");
        setActiveSeverity("all");
        setActiveTimeOrder("newest");
        setCurrentPage(1);
    };
    const isResetDisabled =
        activeFilter === "all" &&
        activeState === "all" &&
        activeSeverity === "all" &&
        activeTimeOrder === "newest";

    useEffect(() => {
        const alertId = searchParams.get("alert");
        if (!alertId || isLoading || alerts.length === 0) return;

        const alertIndex = alerts.findIndex((item, index) => (item.id || `${item.lat}-${item.lng}-${index}`) === alertId);

        const scrollToAlert = () => {
            const el = alertRefs.current.get(alertId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        };

        let scrollTimer: number | undefined;
        const stateTimer = window.setTimeout(() => {
            setDisplayMode("list");
            setActiveFilter("all");
            setActiveSeverity("all");

            if (alertIndex >= 0) {
                setCurrentPage(Math.floor(alertIndex / ALERTS_PER_PAGE) + 1);
            }

            scrollTimer = window.setTimeout(scrollToAlert, 100);
        }, 0);

        return () => {
            window.clearTimeout(stateTimer);
            if (scrollTimer) window.clearTimeout(scrollTimer);
        };
    }, [alerts, isLoading, searchParams]);

    return (
        <div className="flex flex-col gap-10 p-10">
            <div className="flex flex-wrap gap-10 items-start justify-between">
                <div className="flex flex-col gap-10">
                    {/* --- Title --- */}
                    <h1 className="text-6xl font-bold">
                        <span>Active </span>
                        <span className=" text-primary">Alerts</span>
                    </h1>

                    {/* --- Description --- */}
                    <p className="text-xl text-textGrey">
                        Real-time threat monitoring and prioritization for Borneo territories.
                    </p>
                </div>

                {/* --- Display Mode Toggle (List / Map) --- */}
                <AlertMode displayMode={displayMode} setDisplayMode={setDisplayMode} />
            </div>
            
            {/* --- Filter --- */}
            <AlertFilter
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                activeState={activeState}
                stateOptions={MALAYSIA_STATE_OPTIONS}
                onStateChange={handleStateChange}
                activeSeverity={activeSeverity}
                onSeverityChange={handleSeverityChange}
                activeTimeOrder={activeTimeOrder}
                onTimeOrderChange={handleTimeOrderChange}
                onResetFilters={handleResetFilters}
                isResetDisabled={isResetDisabled}
            />

            {/* --- Alert List or Map --- */}
            {
                displayMode === "list" 

                /* --- Alert List --- */
                ? ( 
                    <div className="flex flex-col gap-4">
                        {isLoading ? (
                            skeletonCards.map((_, index) => (
                                <div
                                  key={`alert-skeleton-${index}`}
                                  className="rounded-xl border border-foreground/10 bg-white p-5"
                                >
                                  <Skeleton className="h-5 w-40" />
                                  <Skeleton className="mt-4 h-4 w-64" />
                                  <Skeleton className="mt-2 h-4 w-48" />
                                  <div className="mt-4 flex justify-between">
                                    <Skeleton className="h-9 w-28 rounded-lg" />
                                    <Skeleton className="h-9 w-36 rounded-lg" />
                                  </div>
                                </div>
                              ))
                        ) : alerts.length === 0 ? (
                            <div className="text-center font-bold text-textGrey py-10">No active alerts at this time.</div>
                        ) : filteredAlerts.length === 0 ? (
                            <div className="text-center font-bold text-textGrey py-10">No alerts found for this category.</div>
                        ) : (
                            <>
                                {paginatedAlerts.map((item, index) => {
                                const absoluteIndex = (safeCurrentPage - 1) * ALERTS_PER_PAGE + index;
                                const key = item.id || `${item.lat}-${item.lng}-${absoluteIndex}`;
                                return (
                                    <div key={key} ref={(el) => { if (el) alertRefs.current.set(key, el); }}>
                                        <AlertItem {...item} onMapClick={() => {
                                            setFocusedAlert(item);
                                            setDisplayMode("map");
                                        }} />
                                    </div>
                                );
                                })}

                                <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-foreground/10 bg-white px-4 py-4 shadow-sm">
                                    <span className="text-sm font-semibold text-textGrey">
                                        Page {safeCurrentPage} of {totalPages}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            aria-label="Go to first page"
                                            onClick={() => setCurrentPage(1)}
                                            disabled={safeCurrentPage === 1}
                                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-foreground/10 px-3 text-sm font-bold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {"<<"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                            disabled={safeCurrentPage === 1}
                                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-foreground/10 px-3 text-sm font-bold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {"<"}
                                        </button>
                                        {visiblePages.map((pageNumber) => (
                                            <button
                                                key={pageNumber}
                                                type="button"
                                                onClick={() => setCurrentPage(pageNumber)}
                                                className={`flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                                                    pageNumber === safeCurrentPage
                                                        ? "bg-primary text-white"
                                                        : "border border-foreground/10 text-foreground hover:bg-foreground/5"
                                                }`}
                                            >
                                                {pageNumber}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                            disabled={safeCurrentPage === totalPages}
                                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-foreground/10 px-3 text-sm font-bold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {">"}
                                        </button>
                                        <button
                                            type="button"
                                            aria-label="Go to last page"
                                            onClick={() => setCurrentPage(totalPages)}
                                            disabled={safeCurrentPage === totalPages}
                                            className="flex h-10 min-w-10 items-center justify-center rounded-xl border border-foreground/10 px-3 text-sm font-bold text-foreground transition hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            {">>"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                ) 

                /* --- Alert Map --- */
                : <AlertItemMap alerts={filteredAlerts} activeFilter={activeFilter} focusedAlert={focusedAlert} onPinClick={(alert) => {
                    const filteredIndex = filteredAlerts.findIndex((item) => item.id === alert.id);
                    const fallbackIndex = filteredAlerts.findIndex((item) => item.lat === alert.lat && item.lng === alert.lng && item.title === alert.title);
                    const alertIndex = filteredIndex >= 0 ? filteredIndex : fallbackIndex;
                    const targetPage = alertIndex >= 0 ? Math.floor(alertIndex / ALERTS_PER_PAGE) + 1 : 1;
                    const key = alert.id || `${alert.lat}-${alert.lng}-${alertIndex >= 0 ? alertIndex : 0}`;

                    setDisplayMode("list");
                    setFocusedAlert(null);
                    setCurrentPage(targetPage);

                    setTimeout(() => {
                        const el = alertRefs.current.get(key);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                    }, 150);
                }} />
            }
        </div>
    );
}
