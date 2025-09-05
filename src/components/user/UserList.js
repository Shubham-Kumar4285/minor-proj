import React, { useEffect, useState } from "react";
import { getUsers } from "../../api";

export default function UserList({ onSelect }) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    getUsers().then(res => setUsers(res.data)).catch(()=>{});
  }, []);
  return (
    <div>
      <h2>All Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id} onClick={()=>onSelect(u.id)} style={{cursor:"pointer"}}>
            {u.name} ({u.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
