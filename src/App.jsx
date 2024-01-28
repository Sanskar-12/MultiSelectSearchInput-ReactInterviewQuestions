import { useEffect, useRef, useState } from "react";
import "./App.css";
import Pill from "./components/Pill";

function App() {
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [activeSuggestions, setActiveSuggestions] = useState(0);
  const [selectedUserSet, setSelectedUserSet] = useState(new Set());
  const inputRef = useRef();

  const handleSelectUsers = (user) => {
    setSelected([...selected, user]);
    setSelectedUserSet(new Set([...selectedUserSet, user.email]));
    setSearch("");
    setSuggestions([]);
    inputRef.current.focus();
  };

  const handleRemoveUser = (user) => {
    const updatedUser = selected.filter((select) => select.id !== user.id);
    setSelected(updatedUser);

    const updatedEmails = new Set(selectedUserSet);
    updatedEmails.delete(user.email);
    setSelectedUserSet(updatedEmails);
    inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && e.target.value === "" && selected.length > 0) {
      const lastUser = selected[selected.length - 1];
      handleRemoveUser(lastUser);
      setSuggestions([]);
    } else if (e.key === "ArrowDown" && suggestions?.users?.length > 0) {
      e.preventDefault();
      setActiveSuggestions((prev) =>
        prev < suggestions?.users?.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp" && suggestions?.users?.length > 0) {
      e.preventDefault();
      setActiveSuggestions((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (
      e.key === "Enter" &&
      activeSuggestions >= 0 &&
      activeSuggestions < suggestions.users.length
    ) {
      handleSelectUsers(suggestions.users[activeSuggestions]);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      const fetchData = () => {
        if (search.trim() === "") {
          setSuggestions([]);
        } else {
          fetch(`https://dummyjson.com/users/search?q=${search}`)
            .then((res) => res.json())
            .then((data) => setSuggestions(data))
            .catch((err) => console.log(err));
        }
      };

      fetchData();
    }, 300);

    return () => {
      clearTimeout(id);
    };
  }, [search]);

  return (
    <>
      <div className="user-search-container">
        <div className="user-search-input">
          {selected?.map((user) => (
            <Pill
              key={user.email}
              image={user?.image}
              text={`${user?.firstName} ${user?.lastName}`}
              onClick={() => handleRemoveUser(user)}
            />
          ))}
          <div>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for a User"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <ul className="suggestions-list">
              {suggestions?.users?.map((user, index) =>
                selectedUserSet.has(user.email) ? (
                  <></>
                ) : (
                  <li
                    key={user?.email}
                    onClick={() => handleSelectUsers(user)}
                    className={index === activeSuggestions ? "active" : ""}
                  >
                    <img
                      src={user?.image}
                      alt={`${user?.firstName} ${user?.lastName}`}
                    />
                    <span>
                      {user?.firstName} {user?.lastName}
                    </span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
