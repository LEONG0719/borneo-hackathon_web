"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import { SelectOption } from "./alertPage.utils";

type FilterSelectProps = {
  label: string;
  iconType: "source" | "status" | "severity" | "hazard" | "state" | "order";
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
};

type AlertsFiltersPanelProps = {
  sourceFilter: string;
  statusFilter: string;
  severityFilter: string;
  hazardFilter: string;
  stateFilter: string;
  orderFilter: string;
  sourceOptions: SelectOption[];
  statusOptions: SelectOption[];
  severityOptions: SelectOption[];
  hazardOptions: SelectOption[];
  stateOptions: SelectOption[];
  orderOptions: SelectOption[];
  onSourceChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onHazardChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  onResetFilters: () => void;
  isResetDisabled: boolean;
};

const STATE_FLAG_BY_VALUE: Record<string, string> = {
  all: "/assets/flag-malaysia.svg",
  Johor: "/assets/flag-johor.svg",
  Kedah: "/assets/flag-kedah.svg",
  Kelantan: "/assets/flag-kelantan.svg",
  "Kuala Lumpur": "/assets/flag-kuala-lumpur.svg",
  Labuan: "/assets/flag-labuan.svg",
  Melaka: "/assets/flag-melaka.svg",
  "Negeri Sembilan": "/assets/flag-negeri-sembilan.svg",
  Pahang: "/assets/flag-pahang.svg",
  Perak: "/assets/flag-perak.svg",
  Perlis: "/assets/flag-perlis.svg",
  "Pulau Pinang": "/assets/flag-pulau-pinang.svg",
  Putrajaya: "/assets/flag-putrajaya.svg",
  Sabah: "/assets/flag-sabah.svg",
  Sarawak: "/assets/flag-sarawak.svg",
  Selangor: "/assets/flag-selangor.svg",
  Terengganu: "/assets/flag-terengganu.svg",
};

function getOptionIcon(iconType: FilterSelectProps["iconType"], value: string) {
  const normalizedValue = value.toLowerCase();

  if (iconType === "source") {
    if (normalizedValue === "third_party_api") return { icon: "cloud_sync", color: "#0284C7" };
    if (normalizedValue === "user_report") return { icon: "person_alert", color: "#D97706" };
    return { icon: "hub", color: "#2D6A4F" };
  }

  if (iconType === "status") {
    if (normalizedValue === "published") return { icon: "published_with_changes", color: "#059669" };
    if (normalizedValue === "draft") return { icon: "edit_note", color: "#64748B" };
    return { icon: "rule", color: "#2D6A4F" };
  }

  if (iconType === "severity") {
    if (normalizedValue === "priority") return { icon: "warning", color: "#EF4444" };
    if (normalizedValue === "warning") return { icon: "error", color: "#D97706" };
    if (normalizedValue === "monitor") return { icon: "visibility", color: "#3B82F6" };
    return { icon: "priority_high", color: "#95D5B2" };
  }

  if (iconType === "hazard") {
    if (normalizedValue === "flood") return { icon: "water_drop", color: "#3B82F6" };
    if (normalizedValue === "landslide") return { icon: "landslide", color: "#D97706" };
    if (normalizedValue === "tidal") return { icon: "tsunami", color: "#22D3EE" };
    if (normalizedValue === "other") return { icon: "warning", color: "#EF4444" };
    return { icon: "category", color: "#95D5B2" };
  }

  if (iconType === "state") {
    return { icon: normalizedValue === "all" ? "public" : "location_on", color: "#2D6A4F" };
  }

  if (normalizedValue === "oldest") return { icon: "north", color: "#2D6A4F" };
  return { icon: "south", color: "#2D6A4F" };
}

function FilterOptionIcon({
  iconType,
  value,
  isActive = false,
  size = 18,
}: {
  iconType: FilterSelectProps["iconType"];
  value: string;
  isActive?: boolean;
  size?: number;
}) {
  if (iconType === "state" && STATE_FLAG_BY_VALUE[value]) {
    return <Image src={STATE_FLAG_BY_VALUE[value]} alt="" width={20} height={14} className="w-5" />;
  }

  const optionIcon = getOptionIcon(iconType, value);

  return (
    <span
      className="material-symbols-outlined"
      style={{ color: isActive ? undefined : optionIcon.color, fontSize: size }}
    >
      {optionIcon.icon}
    </span>
  );
}

function FilterSelect({ label, iconType, value, options, onChange }: FilterSelectProps) {
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
          <FilterOptionIcon iconType={iconType} value={selectedOption?.value ?? value} size={22} />
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
                    <FilterOptionIcon
                      iconType={iconType}
                      value={option.value}
                      isActive={isActive}
                    />
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

export default function AlertsFiltersPanel({
  sourceFilter,
  statusFilter,
  severityFilter,
  hazardFilter,
  stateFilter,
  orderFilter,
  sourceOptions,
  statusOptions,
  severityOptions,
  hazardOptions,
  stateOptions,
  orderOptions,
  onSourceChange,
  onStatusChange,
  onSeverityChange,
  onHazardChange,
  onStateChange,
  onOrderChange,
  onResetFilters,
  isResetDisabled,
}: AlertsFiltersPanelProps) {
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
              Narrow by source, status, severity, hazard, state, and sort order.
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FilterSelect
          label="Source"
          iconType="source"
          value={sourceFilter}
          options={sourceOptions}
          onChange={onSourceChange}
        />
        <FilterSelect
          label="Status"
          iconType="status"
          value={statusFilter}
          options={statusOptions}
          onChange={onStatusChange}
        />
        <FilterSelect
          label="Severity"
          iconType="severity"
          value={severityFilter}
          options={severityOptions}
          onChange={onSeverityChange}
        />
        <FilterSelect
          label="Hazard Type"
          iconType="hazard"
          value={hazardFilter}
          options={hazardOptions}
          onChange={onHazardChange}
        />
        <FilterSelect
          label="State"
          iconType="state"
          value={stateFilter}
          options={stateOptions}
          onChange={onStateChange}
        />
        <FilterSelect
          label="Date Order"
          iconType="order"
          value={orderFilter}
          options={orderOptions}
          onChange={onOrderChange}
        />
      </div>
    </div>
  );
}
