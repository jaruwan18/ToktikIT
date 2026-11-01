import { useEffect, useState } from "react";
import {
  DashboardError,
  getRequesterDashboard,
  type DrillDownFilter,
  type RequesterDashboardData,
} from "../api.js";
import {
  DashboardErrorState,
  DashboardTicketList,
  MetricCard,
  MetricCardSkeleton,
} from "./DashboardParts.js";

interface RequesterDashboardProps {
  onOpenTicket: (ticketId: number) => void;
  onDrillDown: (filter: DrillDownFilter, label: string) => void;
}

// Requester Dashboard (ui-spec.md §6-7). The backend derives the Requester
// from the session, so there is no way to request another Requester's data.
export default function RequesterDashboard({
  onOpenTicket,
  onDrillDown,
}: RequesterDashboardProps) {
  const [data, setData] = useState<RequesterDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      setData(await getRequesterDashboard());
    } catch (err) {
      setData(null);
      setError(
        err instanceof DashboardError
          ? err
          : new DashboardError(
              "FAILED",
              "Unable to load dashboard data. Please try again.",
            ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const metrics = data?.metrics;
  const days = data?.recentWindow.days ?? 7;
  const isEmpty =
    metrics !== undefined &&
    metrics.totalOpen === 0 &&
    metrics.waitingForRequester === 0 &&
    metrics.recentlyUpdated === 0 &&
    metrics.recentlyResolved === 0 &&
    data?.recentTickets.length === 0;

  return (
    <section aria-busy={loading}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-1">My Dashboard</h1>
          <p className="page-subtitle mb-0">
            A summary of your own Tickets.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline-success"
          onClick={() => void loadDashboard()}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error ? (
        <DashboardErrorState
          message={error.message}
          forbidden={error.code === "FORBIDDEN"}
          onRetry={() => void loadDashboard()}
        />
      ) : (
        <>
          {loading ? (
            <p className="visually-hidden" role="status">
              Loading dashboard...
            </p>
          ) : null}

          <div className="row g-3 mb-4">
            {loading || !data || !metrics ? (
              [0, 1, 2, 3].map((index) => (
                <div className="col-12 col-sm-6 col-lg-3" key={index}>
                  <MetricCardSkeleton />
                </div>
              ))
            ) : (
              <>
                <div className="col-12 col-sm-6 col-lg-3">
                  <MetricCard
                    label="Total Open Tickets"
                    value={metrics.totalOpen}
                    description="New, Open, In Progress, Waiting or Reopened"
                    onOpen={() =>
                      onDrillDown(
                        data.drillDown.totalOpen,
                        "Total Open Tickets",
                      )
                    }
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <MetricCard
                    label="Waiting for Requester"
                    value={metrics.waitingForRequester}
                    description="Tickets that need your reply"
                    onOpen={() =>
                      onDrillDown(
                        data.drillDown.waitingForRequester,
                        "Waiting for Requester",
                      )
                    }
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <MetricCard
                    label="Recently Updated"
                    value={metrics.recentlyUpdated}
                    description={`Updated in the last ${days} days`}
                    onOpen={() =>
                      onDrillDown(
                        data.drillDown.recentlyUpdated,
                        "Recently Updated",
                      )
                    }
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-3">
                  <MetricCard
                    label="Recently Resolved"
                    value={metrics.recentlyResolved}
                    description={`Resolved or closed in the last ${days} days`}
                    onOpen={() =>
                      onDrillDown(
                        data.drillDown.recentlyResolved,
                        "Recently Resolved",
                      )
                    }
                  />
                </div>
              </>
            )}
          </div>

          {!loading && data ? (
            <>
              {isEmpty ? (
                <div className="zen-alert-info rounded p-3 mb-4" role="status">
                  You have no Tickets requiring attention.
                </div>
              ) : null}

              <DashboardTicketList
                title="Recently Updated Tickets"
                tickets={data.recentTickets}
                emptyMessage="You have no Tickets yet."
                onOpenTicket={onOpenTicket}
              />
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
