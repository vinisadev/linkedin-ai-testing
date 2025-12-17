"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, Users, Briefcase } from "lucide-react";
import { UserCard } from "@/components/search/user-card";
import { cn } from "@/lib/utils";

type SearchType = "all" | "people" | "jobs";

interface SearchResults {
  people: any[];
  jobs: any[];
  nextCursor?: string;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [activeTab, setActiveTab] = useState<SearchType>("people");
  const [results, setResults] = useState<SearchResults>({ people: [], jobs: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&type=${activeTab}`
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query, performSearch]);

  const tabs = [
    { id: "people" as const, label: "People", icon: Users, count: results.people.length },
    { id: "jobs" as const, label: "Jobs", icon: Briefcase, count: results.jobs.length },
  ];

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="card p-4">
        <div className="flex items-center gap-2 text-linkedin-text-gray">
          <Search className="w-5 h-5" />
          {query ? (
            <span>
              Search results for <span className="font-semibold text-linkedin-text-dark">&quot;{query}&quot;</span>
            </span>
          ) : (
            <span>Enter a search term to find people and jobs</span>
          )}
        </div>
      </div>

      {/* Tabs */}
      {query && (
        <div className="card">
          <div className="flex border-b border-linkedin-border-gray">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (query) performSearch(query);
                }}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 font-medium transition-colors relative",
                  activeTab === tab.id
                    ? "text-linkedin-green"
                    : "text-linkedin-text-gray hover:text-linkedin-text-dark"
                )}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {hasSearched && (
                  <span className="text-sm">({tab.count})</span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linkedin-green" />
                )}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="p-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
              </div>
            ) : activeTab === "people" ? (
              results.people.length > 0 ? (
                <div className="space-y-4">
                  {results.people.map((person) => (
                    <UserCard key={person.id} user={person} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  message={`No people found for "${query}"`}
                  suggestion="Try different keywords or check your spelling"
                />
              )
            ) : results.jobs.length > 0 ? (
              <div className="space-y-4">
                {results.jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <EmptyState
                message={`No jobs found for "${query}"`}
                suggestion="Try different keywords or broader search terms"
              />
            )}
          </div>
        </div>
      )}

      {/* No query state */}
      {!query && (
        <div className="card p-8 text-center">
          <Search className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-linkedin-text-dark mb-2">
            Search for people and jobs
          </h2>
          <p className="text-linkedin-text-gray">
            Use the search bar above to find professionals and opportunities
          </p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ message, suggestion }: { message: string; suggestion: string }) {
  return (
    <div className="text-center py-12">
      <Search className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
      <p className="text-linkedin-text-dark font-medium mb-1">{message}</p>
      <p className="text-linkedin-text-gray text-sm">{suggestion}</p>
    </div>
  );
}

function JobCard({ job }: { job: any }) {
  return (
    <div className="flex gap-4 p-4 border border-linkedin-border-gray rounded-lg hover:bg-linkedin-warm-gray transition-colors">
      <div className="w-12 h-12 bg-linkedin-warm-gray rounded flex items-center justify-center flex-shrink-0">
        {job.companyLogo ? (
          <img src={job.companyLogo} alt={job.company} className="w-full h-full object-contain" />
        ) : (
          <Briefcase className="w-6 h-6 text-linkedin-text-gray" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-linkedin-blue hover:underline cursor-pointer">
          {job.title}
        </h3>
        <p className="text-linkedin-text-dark">{job.company}</p>
        <p className="text-sm text-linkedin-text-gray">
          {job.location} {job.remote && "• Remote"}
        </p>
      </div>
    </div>
  );
}
