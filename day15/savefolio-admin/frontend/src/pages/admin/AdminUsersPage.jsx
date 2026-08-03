import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import useAuth from "../../hooks/useAuth";
import {
  getAdminUsers,
  updateAdminUser,
} from "../../services/adminService";


const PAGE_SIZE = 10;


function formatJoinedDate(value) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}


export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [pendingAction, setPendingAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminUsers({
        search,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      setUsers(data.items);
      setTotal(data.total);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  function handleSearch(event) {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setPage(1);
  }

  function requestAction(target, field) {
    setPendingAction({
      target,
      field,
      nextValue: !target[field],
    });
    setNotice("");
  }

  async function confirmAction() {
    if (!pendingAction) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await updateAdminUser(
        pendingAction.target.id,
        {
          [pendingAction.field]: pendingAction.nextValue,
        },
      );

      setUsers((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item,
        ),
      );
      setNotice("User access updated successfully.");
      setPendingAction(null);
    } catch (updateError) {
      setError(updateError.message);
      setPendingAction(null);
    } finally {
      setSaving(false);
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  const actionLabel = pendingAction?.field === "is_admin"
    ? pendingAction.nextValue
      ? "grant administrator access"
      : "remove administrator access"
    : pendingAction?.nextValue
      ? "activate this account"
      : "disable this account";

  return (
    <>
      <div className="page-heading admin-heading">
        <div>
          <span className="page-kicker">Administration</span>
          <h1>Users</h1>
          <p>Manage account status and administrator roles.</p>
        </div>
      </div>

      {notice && (
        <div className="alert alert--success">{notice}</div>
      )}

      {error && (
        <div className="alert alert--error">{error}</div>
      )}

      <section className="panel">
        <form className="admin-filters" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search by name or email"
            value={draftSearch}
            onChange={(event) =>
              setDraftSearch(event.target.value)
            }
          />
          <Button type="submit">Search</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setDraftSearch("");
              setSearch("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        </form>

        {loading ? (
          <Spinner />
        ) : users.length ? (
          <>
            <div className="table-wrapper">
              <table className="data-table admin-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Transactions</th>
                    <th className="align-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isSelf = user.id === currentUser.id;

                    return (
                      <tr key={user.id}>
                        <td>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </td>
                        <td>
                          <span className={`access-badge ${user.is_admin ? "access-badge--admin" : ""}`}>
                            {user.is_admin ? "Admin" : "Member"}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.is_active ? "status-badge--active" : "status-badge--disabled"}`}>
                            {user.is_active ? "Active" : "Disabled"}
                          </span>
                        </td>
                        <td>{formatJoinedDate(user.created_at)}</td>
                        <td>{user.transaction_count}</td>
                        <td className="align-right actions">
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() =>
                              requestAction(user, "is_admin")
                            }
                          >
                            {user.is_admin
                              ? "Make member"
                              : "Make admin"}
                          </button>
                          <button
                            type="button"
                            className={user.is_active ? "danger-link" : ""}
                            disabled={isSelf}
                            onClick={() =>
                              requestAction(user, "is_active")
                            }
                          >
                            {user.is_active ? "Disable" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Page {page} of {totalPages}</span>
              <div>
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((value) => value - 1)
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((value) => value + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No users found</h3>
            <p>Try a different name or email address.</p>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(pendingAction)}
        title="Confirm access change"
        onClose={() => setPendingAction(null)}
      >
        <p>
          Are you sure you want to {actionLabel} for{" "}
          <strong>{pendingAction?.target.name}</strong>?
        </p>
        <div className="form-actions">
          <Button
            variant="secondary"
            onClick={() => setPendingAction(null)}
          >
            Cancel
          </Button>
          <Button isLoading={saving} onClick={confirmAction}>
            Confirm change
          </Button>
        </div>
      </Modal>
    </>
  );
}
