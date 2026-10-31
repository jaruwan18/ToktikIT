import { useEffect, useState } from "react";
import {
  DashboardError,
  getStaffDashboard,
  type DrillDownFilter,
  type StaffDashboardData,
} from "../api.js";
import {
  DashboardErrorState,
  DashboardTicketList,
  MetricCard,
  MetricCardSkeleton,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
} from "./DashboardParts.js";

interface StaffDashboardProps {
  onOpenTicket: (ticketId: number) => void;
  onDrillDown: (filter: DrillDownFilter, label: string) => void;
}

// IT Staff Dashboard (ui-spec.md §4-5), used by IT Staff and Administrators.
export default function StaffDashboard({
  onOpenTicket,
  onDrillDown,
}: StaffDashboardProps) {
  const [data, setData] = useState<StaffDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<DashboardError | null>(null);

  async function loadDashboard() {
    setLoading(true);
    setError(null);

    try {
      setData(await getStaffDashboard());
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

  const ready = !loading && data !== null;
  const days = data?.recentWindow.days ?? 7;
  const activeTotal = data
    ? PRIORITY_ORDER.reduce(
        (sum, priority) => sum + data.metrics.byItPriority[priority],
        0,
      )
    : 0;

  return (
    <section aria-busy={loading}>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h1 className="page-title mb-1">IT Staff Dashboard</h1>
          <p className="page-subtitle mb-0">
            Tickets that need attention across the IT Service Desk.
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

          {ready && activeTotal === 0 ? (
            <div className="zen-alert-info rounded p-3 mb-4" role="status">
              No Tickets currently require attention.
            </div>
          ) : null}

          <div className="row g-3 mb-4">
            {!ready || !data ? (
              [0, 1, 2].map((index) => (
                <div className="col-12 col-md-4" key={index}>
                  <MetricCardSkeleton />
                </div>
              ))
            ) : (
              <>
                <div className="col-12 col-md-4">
                  <MetricCard
                    label="Unassigned Tickets"
                    value={data.metrics.unassigned}
                    description="Active Tickets without an owner"
                    onOpen={() =>
                      onDrillDown(
                        data.drillDown.unassigned,
                        "Unassigned Tickets",
                      )
                    }
                  />
                </div>
                <div className="col-12 col-md-4">
                  <MetricCard
                    label="My Owned Tickets"
                    value={data.metrics.currentUserOwned}
                    description="Active Tickets assigned to you"
                    onOpen={() =>
                      onDrillDown(
                        data.drillDown.currentUserOwned,
                        "My Owned Tickets",
                      )
                    }
                  />
                </div>
                <div className="col-12 col-md-4">
                  <MetricCard
                    label="My Actions Taken"
                    value={data.metrics.myActionsTaken}
                    description={`Recorded by you in the last ${days} days`}
                  />
                </div>
              </>
            )}
          </div>

          {ready && data ? (
            <>
              <section className="mb-4" aria-labelledby="status-summary-heading">
                <h2 id="status-summary-heading" className="h6 mb-2">
                  Status Summary
                </h2>
                <div className="row g-2">
                  {STATUS_ORDER.map((status) => (
                    <div className="col-6 col-md-3" key={status}>
                      <MetricCard
                        label={STATUS_LABELS[status]}
                        value={data.metrics.byStatus[status]}
                        onOpen={() =>
                          onDrillDown(
                            data.drillDown.byStatus[status],
                            `Status: ${STATUS_LABELS[status]}`,
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <section className="mb-4" aria-labelledby="priority-summary-heading">
                <h2 id="priority-summary-heading" className="h6 mb-2">
                  IT Priority Summary (active Tickets)
                </h2>
                <div className="row g-2">
                  {PRIORITY_ORDER.map((priority) => (
                    <div className="col-12 col-sm-4" key={priority}>
                      <MetricCard
                        label={PRIORITY_LABELS[priority]}
                        value={data.metrics.byItPriority[priority]}
                        onOpen={() =>
                          onDrillDown(
                            data.drillDown.byItPriority[priority],
                            `IT Priority: ${PRIORITY_LABELS[priority]}`,
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </section>

              <div className="row g-3">
                <div className="col-12 col-lg-6">
                  <DashboardTicketList
                    title="Urgent Tickets"
                    tickets={data.urgentTickets}
                    emptyMessage="No active High priority Tickets."
                    showItPriority
                    onOpenTicket={onOpenTicket}
                  />
                </div>
                <div className="col-12 col-lg-6">
                  <DashboardTicketList
                    title="Recently Updated"
                    tickets={data.recentTickets}
                    emptyMessage="No Tickets have been updated yet."
                    showItPriority
                    onOpenTicket={onOpenTicket}
                  />
                </div>
              </div>
            </>
          ) : null}
        </>
      )}
    </section>
  );
}
