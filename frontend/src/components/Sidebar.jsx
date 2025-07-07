import { Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

// A small debounce hook
function useDebounce(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(h);
  }, [value, delay]);
  return debounced;
}

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();

  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  // debounce the raw searchValue for smoother UX
  const debouncedSearch = useDebounce(searchValue, 200);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // 1. Filter by online-only
  const filteredUsers = useMemo(
    () =>
      showOnlineOnly
        ? users.filter((u) => onlineUsers.includes(u._id))
        : users,
    [showOnlineOnly, users, onlineUsers]
  );

  // 2. Filter by (debounced) search term
  const searchedUsers = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    if (term === "") return filteredUsers;

    return filteredUsers.filter((user) => {
      // guard against undefined
      const rawName = user.fullName ?? "";
      const name = rawName.toLowerCase();
      // change to startsWith(...) if you want prefix-only search
      return name.includes(term);
    });
  }, [debouncedSearch, filteredUsers]);

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-96 rounded-xl border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex justify-between items-center gap-5">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium">Contacts</span>
          </div>
          <label className="input rounded-3xl flex-1 flex items-center gap-2 px-3">
            <Search className="opacity-50" />
            <input
              type="search"
              className="grow bg-transparent outline-none"
              placeholder="Search"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
          </label>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Show online only</span>
          </label>
          <span className="text-xs text-zinc-500">
            ({onlineUsers.length - 1} online)
          </span>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 px-4 lg:px-0 flex flex-col items-left gap-3 md:gap-4">
        {searchedUsers.length > 0 ? (
          searchedUsers.map((user) => (
            <button
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`
                w-full md:w-[340px] p-3 md:mx-3 rounded-2xl flex items-center gap-3
                hover:bg-base-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-300/30 transition-all
                ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
              `}
            >
              <div className="relative">
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-12 object-cover rounded-full"
                />
                {onlineUsers.includes(user._id) && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-zinc-900" />
                )}
              </div>
              <div className="text-left min-w-0">
                <div className="font-medium truncate">{user.fullName}</div>
                <div className="text-sm text-zinc-400">
                  {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center text-zinc-500 py-4">
            {showOnlineOnly
              ? "No online users"
              : searchValue
              ? "No users match your search."
              : "No contacts found."}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
