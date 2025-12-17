"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Building2, Search, X, Check } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  headline: string | null;
  industry: string | null;
  location: string | null;
}

interface CompanySelectProps {
  value: string;
  companyId: string | null;
  onChange: (company: string, companyId: string | null) => void;
  placeholder?: string;
}

export function CompanySelect({
  value,
  companyId,
  onChange,
  placeholder = "Search for a company...",
}: CompanySelectProps) {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedSearch = useDebounce(inputValue, 300);

  // Search for companies when input changes
  const searchCompanies = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCompanies([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/companies/search?q=${encodeURIComponent(query)}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Failed to search companies:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debouncedSearch && isOpen) {
      searchCompanies(debouncedSearch);
    }
  }, [debouncedSearch, isOpen, searchCompanies]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync with external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSelectedCompany(null);
    onChange(newValue, null);
    setIsOpen(true);
  };

  const handleSelectCompany = (company: Company) => {
    setInputValue(company.name);
    setSelectedCompany(company);
    onChange(company.name, company.id);
    setIsOpen(false);
  };

  const handleClearSelection = () => {
    setInputValue("");
    setSelectedCompany(null);
    onChange("", null);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    if (inputValue.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {selectedCompany ? (
          // Selected company display
          <div className="flex items-center gap-3 px-3 py-2 border border-linkedin-border-gray rounded-md bg-blue-50">
            <div className="w-8 h-8 rounded bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden flex-shrink-0">
              {selectedCompany.logo ? (
                <img
                  src={selectedCompany.logo}
                  alt={selectedCompany.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-4 h-4 text-linkedin-text-gray" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-linkedin-text-dark text-sm truncate">
                {selectedCompany.name}
              </p>
              {selectedCompany.headline && (
                <p className="text-xs text-linkedin-text-gray truncate">
                  {selectedCompany.headline}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-linkedin-text-gray" />
            </button>
          </div>
        ) : (
          // Search input
          <>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-linkedin-text-gray" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
            />
          </>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !selectedCompany && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-linkedin-border-gray rounded-md shadow-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-linkedin-text-gray text-center">
              Searching...
            </div>
          ) : companies.length > 0 ? (
            <>
              {companies.map((company) => (
                <button
                  key={company.id}
                  type="button"
                  onClick={() => handleSelectCompany(company)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-linkedin-warm-gray transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden flex-shrink-0">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-5 h-5 text-linkedin-text-gray" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-linkedin-text-dark text-sm truncate">
                      {company.name}
                    </p>
                    <p className="text-xs text-linkedin-text-gray truncate">
                      {[company.industry, company.location]
                        .filter(Boolean)
                        .join(" • ") || "Company on LinkedIn"}
                    </p>
                  </div>
                  {companyId === company.id && (
                    <Check className="w-4 h-4 text-linkedin-blue flex-shrink-0" />
                  )}
                </button>
              ))}
              {inputValue.trim() && (
                <div className="px-4 py-2 text-xs text-linkedin-text-gray border-t border-linkedin-border-gray">
                  Not finding your company? Just type the name and continue.
                </div>
              )}
            </>
          ) : inputValue.trim() ? (
            <div className="px-4 py-3 text-sm text-linkedin-text-gray">
              <p>No companies found for &quot;{inputValue}&quot;</p>
              <p className="text-xs mt-1">
                You can still use this name - just continue typing.
              </p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
