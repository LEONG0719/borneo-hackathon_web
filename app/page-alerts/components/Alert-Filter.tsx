import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

// --- Filter Options for Alert Categories ---
export const filterOptions: { label: string; icon: string; color: string; value: string }[] = [
    { label: "All Threats", icon: "category", color: "#95D5B2", value: "all" },
    { label: "Flood", icon: "water_drop", color: "#3B82F6", value: "flood" },
    { label: "Landslide", icon: "landslide", color: "#D97706", value: "landslide" },
    { label: "Tidal", icon: "tsunami", color: "#22D3EE", value: "tidal" },
    { label: "Other", icon: "warning", color: "#EF4444", value: "other" },
];

const severityOptions: FilterOption[] = [
    { label: "All Severities", icon: "priority_high", color: "#95D5B2", value: "all" },
    { label: "Priority", icon: "warning", color: "#EF4444", value: "priority" },
    { label: "Warning", icon: "error", color: "#D97706", value: "warning" },
    { label: "Monitor", icon: "visibility", color: "#3B82F6", value: "monitor" },
];

const timeOrderOptions: FilterOption[] = [
    { label: "Newest First", icon: "south", color: "#2D6A4F", value: "newest" },
    { label: "Oldest First", icon: "north", color: "#2D6A4F", value: "oldest" },
];

type FilterOption = {
    label: string;
    value: string;
    icon?: string;
    color?: string;
    image?: string;
};

type FilterSelectProps = {
    label: string;
    value: string;
    options: FilterOption[];
    onChange: (value: string) => void;
};

interface AlertFilterProps {
    activeFilter: string;
    onFilterChange: (value: string) => void;
    activeState: string;
    stateOptions: { label: string; flag: string }[];
    onStateChange: (value: string) => void;
    activeSeverity: string;
    onSeverityChange: (value: string) => void;
    activeTimeOrder: string;
    onTimeOrderChange: (value: string) => void;
    onResetFilters: () => void;
    isResetDisabled: boolean;
}

function FilterIcon({ option, size = 18 }: { option: FilterOption; size?: number }) {
    if (option.image) {
        return <Image src={option.image} alt="" width={20} height={14} className="w-5" />;
    }

    return (
        <span
            className="material-symbols-outlined"
            style={{ color: option.color, fontSize: size }}
        >
            {option.icon ?? "filter_alt"}
        </span>
    );
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const selectedOption = options.find((option) => option.value === value) ?? options[0];

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;

            if (!menuRef.current?.contains(target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    return (
        <div ref={menuRef} className="relative min-w-[210px] flex-1">
            <button
                type="button"
                onClick={() => setIsOpen((open) => !open)}
                className="flex w-full items-center justify-between rounded-[1.75rem] border border-foreground/10 bg-linear-to-r from-white to-primary/5 px-4 py-3 text-left shadow-sm transition hover:border-primary/30 hover:shadow-md"
            >
                <span className="flex min-w-0 items-center gap-3">
                    <FilterIcon option={selectedOption} size={22} />
                    <span className="flex min-w-0 flex-col">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-textGrey">
                            {label}
                        </span>
                        <span className="truncate text-sm font-semibold text-foreground">
                            {selectedOption?.label ?? options[0]?.label ?? "Select"}
                        </span>
                    </span>
                </span>
                <span
                    className={`material-symbols-outlined text-textGrey transition ${
                        isOpen ? "rotate-180 text-primary" : ""
                    }`}
                >
                    expand_more
                </span>
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-20 overflow-hidden rounded-4xl border border-foreground/10 bg-white shadow-2xl">
                    <div className="max-h-72 overflow-y-auto p-2">
                        {options.map((option) => {
                            const isActive = option.value === value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`flex w-full items-center justify-between rounded-full px-4 py-3 text-left text-sm font-semibold transition ${
                                        isActive
                                            ? "bg-primary text-surface shadow-sm"
                                            : "text-foreground hover:bg-primary/8"
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <FilterIcon option={option} />
                                        <span>{option.label}</span>
                                    </span>
                                    {isActive && (
                                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                                            check
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function AlertFilter({
    activeFilter,
    onFilterChange,
    activeState,
    stateOptions,
    onStateChange,
    activeSeverity,
    onSeverityChange,
    activeTimeOrder,
    onTimeOrderChange,
    onResetFilters,
    isResetDisabled,
}: AlertFilterProps) {
    const malaysiaStateOptions: FilterOption[] = [
        { label: "All State", value: "all", image: "/assets/flag-malaysia.svg" },
        ...stateOptions.map((state) => ({
            label: state.label,
            value: state.label,
            image: state.flag,
        })),
    ];

    return (
        <div className="rounded-[2rem] border border-foreground/10 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <TuneRoundedIcon />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-foreground">Filter Alerts</span>
                        <span className="text-sm text-textGrey">
                            Narrow by category, state, severity, and time order.
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onResetFilters}
                    disabled={isResetDisabled}
                    className="rounded-full border border-foreground/10 px-4 py-2 text-sm font-semibold text-textGrey transition hover:border-primary/30 hover:bg-primary/8 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-foreground/10 disabled:hover:bg-transparent disabled:hover:text-textGrey"
                >
                    Reset filter
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                    label="Alert Category"
                    value={activeFilter}
                    options={filterOptions}
                    onChange={onFilterChange}
                />
                <FilterSelect
                    label="State"
                    value={activeState}
                    options={malaysiaStateOptions}
                    onChange={onStateChange}
                />
                <FilterSelect
                    label="Severity"
                    value={activeSeverity}
                    options={severityOptions}
                    onChange={onSeverityChange}
                />
                <FilterSelect
                    label="Time Order"
                    value={activeTimeOrder}
                    options={timeOrderOptions}
                    onChange={onTimeOrderChange}
                />
            </div>
        </div>
    );
}
