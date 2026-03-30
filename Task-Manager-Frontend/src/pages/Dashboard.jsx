
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("board"); // board, backlog, reports, team
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  
  // Detail Panel State
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editAssignee, setEditAssignee] = useState(null);
  const [editType, setEditType] = useState("");
  const [editSprint, setEditSprint] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [assigneeSearch, setAssigneeSearch] = useState("");

  // Sprint Create State
  const [newSprintName, setNewSprintName] = useState("");
  const [showSprintModal, setShowSprintModal] = useState(false);

  // Member Add State
  const [newMemberEmail, setNewMemberEmail] = useState("");

  const detailPanelRef = useRef();
  const nav = useNavigate();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      // 1. Load Teams first to get current context
      const teamRes = await api.get("/teams");
      setTeams(teamRes.data);
      
      const sessionTeamId = localStorage.getItem("currentTeamId");
      const initialTeam = teamRes.data.find(t => t._id === sessionTeamId) || teamRes.data[0];
      
      if (initialTeam) {
        setCurrentTeam(initialTeam);
        localStorage.setItem("currentTeamId", initialTeam._id);
        await refreshWorkspaceData(initialTeam._id);
      }
    } catch (err) {
      console.error("Initialization error", err);
    } finally {
      setLoading(false);
    }
  };

  const refreshWorkspaceData = async (tid) => {
    await Promise.all([
      loadTasks(tid),
      loadSprints(tid),
      loadUsers()
    ]);
  };

  const loadTasks = async (tid) => {
    const r = await api.get(`/tasks/${tid}`);
    setTasks(r.data);
  };

  const loadSprints = async (tid) => {
    const r = await api.get(`/sprints/${tid}`);
    setSprints(r.data);
  };

  const loadUsers = async () => {
    const r = await api.get("/users");
    setUsers(r.data);
  };

  const handleTeamChange = async (team) => {
    setCurrentTeam(team);
    localStorage.setItem("currentTeamId", team._id);
    setLoading(true);
    await refreshWorkspaceData(team._id);
    setLoading(false);
  };

  const openTaskDetail = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description || "");
    setEditStatus(task.status);
    setEditPriority(task.priority);
    setEditType(task.type);
    setEditAssignee(task.assignee);
    setEditSprint(task.sprint?._id || task.sprint || "");
    setAssigneeSearch(task.assignee?.email || "");

    gsap.to(detailPanelRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
  };

  const closeTaskDetail = () => {
    gsap.to(detailPanelRef.current, { x: 500, duration: 0.4, ease: "power3.in", onComplete: () => {
      setSelectedTask(null);
    }});
  };

  const handleSaveTask = async () => {
    if (!selectedTask) return;
    
    const updates = {
      title: editTitle,
      description: editDesc,
      status: editStatus,
      priority: editPriority,
      type: editType,
      assignee: editAssignee ? editAssignee._id : null,
      sprint: editSprint || null
    };

    try {
      await api.put(`/tasks/${selectedTask._id}`, updates);
      // Refresh local list
      setTasks(tasks.map(t => t._id === selectedTask._id ? { ...t, ...updates, assignee: editAssignee } : t));
      closeTaskDetail();
      showToast("Objective Saved");
    } catch (err) {
      alert("Synchronization Error");
    }
  };

  const createTask = async (type = "task", sprintId = null) => {
     if (!currentTeam) return alert("Select a team first");
     const newTaskData = { 
       title: "New Issues to solve", 
       team: currentTeam._id, 
       status: "todo", 
       type: type, 
       priority: "medium",
       sprint: sprintId
     };
     
     const r = await api.post("/tasks", newTaskData);
     setTasks([r.data, ...tasks]);
     openTaskDetail(r.data);
  };

  const handleCreateSprint = async () => {
    if (!newSprintName || !currentTeam) return;
    const r = await api.post("/sprints", { 
      name: newSprintName, 
      team: currentTeam._id,
      status: "planned" 
    });
    setSprints([r.data, ...sprints]);
    setNewSprintName("");
    setShowSprintModal(false);
    showToast("Sprint Initialized");
  };

  const handleCompleteSprint = async (sprintId) => {
    if(!window.confirm("Terminate this sprint session? Incomplete tasks will return to backlog.")) return;
    await api.post(`/sprints/${sprintId}/complete`);
    await refreshWorkspaceData(currentTeam._id);
    showToast("Sprint Completed");
  };

  const handleAddMember = async () => {
    if (!newMemberEmail || !currentTeam) return;
    try {
      await api.post("/teams/add-member", { 
        teamId: currentTeam._id, 
        email: newMemberEmail 
      });
      setNewMemberEmail("");
      const updatedTeamRes = await api.get(`/teams/${currentTeam._id}`);
      setCurrentTeam(updatedTeamRes.data);
      showToast("Member Recruited");
    } catch (err) {
      alert("Member not found in identity registry.");
    }
  };

  const showToast = (msg) => {
    const toast = document.createElement("div");
    toast.innerText = msg;
    toast.style.cssText = "position:fixed;bottom:24px;right:24px;background:var(--primary);color:white;padding:12px 24px;border-radius:4px;z-index:9999;font-weight:700;box-shadow:0 4px 12px rgba(0,0,0,0.2);";
    document.body.appendChild(toast);
    gsap.from(toast, { y: 20, opacity: 0, duration: 0.4 });
    setTimeout(() => gsap.to(toast, { opacity: 0, y: -20, onComplete: () => toast.remove() }), 2500);
  };

  const getPriorityIcon = (p) => {
    switch(p) {
      case 'highest': return <span style={{color: 'var(--highest)', fontWeight:800}}>↑↑</span>;
      case 'high': return <span style={{color: 'var(--high)', fontWeight:800}}>↑</span>;
      case 'medium': return <span style={{color: 'var(--medium)', fontWeight:800}}>=</span>;
      case 'low': return <span style={{color: 'var(--low)', fontWeight:800}}>↓</span>;
      case 'lowest': return <span style={{color: 'var(--lowest)', fontWeight:800}}>↓↓</span>;
      default: return '=';
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "all" || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const activeSprint = sprints.find(s => s.status === "active") || sprints.find(s => s.status === "planned");

  const renderBoard = () => {
    const sprintTasks = activeSprint ? filteredTasks.filter(t => (t.sprint?._id || t.sprint) === activeSprint._id) : [];
    const renderCol = (status, label) => {
      const colTasks = sprintTasks.filter(t => t.status === status);
      return (
        <div className="board-column">
          <div className="column-header">{label} <span className="count-badge">{colTasks.length}</span></div>
          <div className="task-list">
            {colTasks.map(t => (
              <div key={t._id} className="jira-task-card" onClick={() => openTaskDetail(t)}>
                <div className="task-title" style={{marginBottom: '4px'}}>{t.title}</div>
                {t.description && <div style={{fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>
                  {t.description}
                </div>}
                <div className="task-footer">
                   <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <span>{t.type === 'bug' ? '🐞' : t.type === 'story' ? '📗' : '📋'}</span>
                      {getPriorityIcon(t.priority)}
                      <span className="task-id">TM-{t._id.substring(0,4).toUpperCase()}</span>
                   </div>
                   <div className="avatar" style={{background: t.assignee ? 'var(--primary)' : '#dfe1e6'}}>
                      {t.assignee?.email ? t.assignee.email.substring(0,2).toUpperCase() : '?'}
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="board-container fade-in">
        {renderCol("todo", "To Do")}
        {renderCol("in-progress", "In Progress")}
        {renderCol("done", "Done")}
        {!activeSprint && <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '100px', opacity: 0.5}}>No active sprint. Please start one from the backlog.</div>}
      </div>
    );
  };

  const renderBacklog = () => {
    return (
      <div className="backlog-container fade-in">
        {sprints.filter(s => s.status !== "completed").map((s, idx) => (
          <div key={s._id} style={{marginBottom: '32px'}}>
            <div className="sprint-header">
               <div className="sprint-name">⚡ {s.name} ({s.status})</div>
               <div className="sprint-controls">
                  <span className="count-badge">{tasks.filter(t => (t.sprint?._id || t.sprint) === s._id).length} issues</span>
                  {s.status === "planned" ? (
                    <button className="jira-btn btn-blue" onClick={() => api.put(`/sprints/${s._id}`, {status: 'active'}).then(() => loadSprints(currentTeam._id))}>Start sprint</button>
                  ) : (
                    <button className="jira-btn" onClick={() => handleCompleteSprint(s._id)}>Complete sprint</button>
                  )
                  }
               </div>
            </div>
            <div style={{border: '1px solid var(--border)', borderRadius: '3px', background: 'white'}}>
               {tasks.filter(t => (t.sprint?._id || t.sprint) === s._id).map(t => (
                 <div key={t._id} className="backlog-item" onClick={() => openTaskDetail(t)}>
                   <span>{t.type === 'bug' ? '🐞' : t.type === 'story' ? '📗' : '📋'}</span>
                   <span style={{color: 'var(--text-muted)', width: '70px', fontSize: '12px', fontWeight: 600}}>TM-{t._id.substring(0,4)}</span>
                   <span style={{flex: 1}}>{t.title}</span>
                   <span className={`badge badge-${t.status.replace('-','')}`}>{t.status}</span>
                   {getPriorityIcon(t.priority)}
                 </div>
               ))}
               <div className="backlog-item" style={{color: 'var(--text-muted)', cursor: 'pointer'}} onClick={() => createTask("task", s._id)}>+ Create issue</div>
            </div>
          </div>
        ))}

        <div className="sprint-header" style={{background: 'none', border: '1px dashed var(--border)'}}>
           <div className="sprint-name">Backlog ({tasks.filter(t => !t.sprint).length} issues)</div>
           <button className="jira-btn btn-blue" onClick={() => setShowSprintModal(true)}>Create sprint</button>
        </div>
        <div style={{border: '1px solid var(--border)', borderRadius: '3px', background: 'white'}}>
           {tasks.filter(t => !t.sprint).map(t => (
              <div key={t._id} className="backlog-item" onClick={() => openTaskDetail(t)}>
                <span>{t.type === 'bug' ? '🐞' : t.type === 'story' ? '📗' : '📋'}</span>
                <span style={{color: 'var(--text-muted)', width: '70px', fontSize: '12px', fontWeight: 600}}>TM-{t._id.substring(0,4)}</span>
                <span style={{flex: 1}}>{t.title}</span>
                {getPriorityIcon(t.priority)}
              </div>
           ))}
        </div>
      </div>
    );
  };

  const renderReports = () => {
    const stats = {
      todo: tasks.filter(t => t.status === 'todo').length,
      inprogress: tasks.filter(t => t.status === 'in-progress').length,
      done: tasks.filter(t => t.status === 'done').length,
      total: tasks.length
    };

    const maxVal = Math.max(stats.todo, stats.inprogress, stats.done, 1);

    return (
      <div className="reports-container fade-in">
        <div className="report-card">
          <div className="report-title">Efficiency Overview</div>
          <div style={{display: 'flex', gap: '40px', alignItems: 'center'}}>
            <div>
              <div className="stat-value">{stats.total}</div>
              <div style={{fontSize: '12px', color: 'var(--text-muted)'}}>Total Issues</div>
            </div>
            <div style={{flex: 1, height: '4px', background: '#f4f5f7', borderRadius: '4px', overflow: 'hidden', display: 'flex'}}>
              <div style={{width: `${(stats.done/maxVal)*100}%`, background: 'var(--done-text)'}}></div>
              <div style={{width: `${(stats.inprogress/maxVal)*100}%`, background: 'var(--primary)'}}></div>
            </div>
          </div>
        </div>

        <div className="report-card" style={{gridColumn: '1 / -1'}}>
          <div className="report-title">Workload Distribution</div>
          <div className="chart-bar-container">
            <div className="chart-bar" style={{height: `${(stats.todo/maxVal)*100}%`, background: 'var(--todo-text)'}}>
              <div className="chart-label">TO DO ({stats.todo})</div>
            </div>
            <div className="chart-bar" style={{height: `${(stats.inprogress/maxVal)*100}%`, background: 'var(--primary)'}}>
              <div className="chart-label">IN PROGRESS ({stats.inprogress})</div>
            </div>
            <div className="chart-bar" style={{height: `${(stats.done/maxVal)*100}%`, background: 'var(--done-text)'}}>
              <div className="chart-label">DONE ({stats.done})</div>
            </div>
          </div>
        </div>
        
        <div className="report-card">
           <div className="report-title">Team Presence</div>
           <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              {currentTeam?.members?.map(u => (
                <div key={u._id} className="avatar" title={u?.email} style={{width: '32px', height: '32px', background: 'var(--primary)', color: 'white'}}>
                  {u?.email ? u.email.substring(0,2).toUpperCase() : '?'}
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  const renderTeam = () => {
    return (
      <div className="reports-container fade-in">
        <div className="report-card" style={{gridColumn: '1 / -1'}}>
          <div className="report-title">Team Membership: {currentTeam?.name}</div>
          <div style={{display: 'flex', gap: '16px', marginBottom: '32px'}}>
             <input 
               className="auth-input" 
               placeholder="Recruit member by email..." 
               value={newMemberEmail}
               onChange={e => setNewMemberEmail(e.target.value)}
               style={{maxWidth: '300px'}}
             />
             <button className="jira-btn btn-blue" onClick={handleAddMember}>Add Member</button>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px'}}>
             {currentTeam?.members?.map(m => (
               <div key={m._id} className="report-card" style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '16px'}}>
                  <div className="avatar" style={{background: 'var(--primary)', width: '40px', height: '40px'}}>{m?.email ? m.email.substring(0,2).toUpperCase() : '?'}</div>
                  <div>
                    <div style={{fontWeight: 700, fontSize: '14px'}}>{m?.email || 'Unknown User'}</div>
                    <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>{m?.role ? m.role.toUpperCase() : 'USER'}</div>
                  </div>
               </div>
             ))}
          </div>
        </div>
        
        <div className="report-card" style={{gridColumn: '1 / -1'}}>
          <div className="report-title">Workspace Switch</div>
          <div style={{display: 'flex', gap: '12px'}}>
            {teams.map(t => (
              <button 
                key={t._id} 
                className={`jira-btn ${currentTeam?._id === t._id ? 'btn-blue' : 'btn-ghost'}`}
                onClick={() => handleTeamChange(t)}
              >
                {t.name}
              </button>
            ))}
            <button className="jira-btn" style={{border: '1px dashed var(--primary)', color: 'var(--primary)'}} onClick={handleCreateTeam}>+ New Workspace</button>
          </div>
        </div>
      </div>
    );
  };

  const handleCreateTeam = async () => {
    const name = prompt("Project Workspace Name:");
    if (!name) return;
    try {
      const r = await api.post("/teams", { name });
      setTeams([...teams, r.data]);
      handleTeamChange(r.data);
      showToast("Workspace Initialized");
    } catch (err) {
      alert("Only administrators can initialize new workspaces.");
    }
  };

  return (
    <div className="jira-app">
      {/* Sidebar */}
      <aside className="jira-sidebar">
        <div className="sidebar-item" style={{marginBottom: '20px'}}><span className="item-icon" style={{fontSize: '24px'}}>🔷</span></div>
        <div className={`sidebar-item ${view === 'board' ? 'active' : ''}`} onClick={() => setView("board")}><span className="item-icon">📋</span><span className="item-text">Board</span></div>
        <div className={`sidebar-item ${view === 'backlog' ? 'active' : ''}`} onClick={() => setView("backlog")}><span className="item-icon">📂</span><span className="item-text">Backlog</span></div>
        <div className={`sidebar-item ${view === 'reports' ? 'active' : ''}`} onClick={() => setView("reports")}><span className="item-icon">📊</span><span className="item-text">Reports</span></div>
        <div className={`sidebar-item ${view === 'team' ? 'active' : ''}`} onClick={() => setView("team")}><span className="item-icon">👥</span><span className="item-text">Team</span></div>
        <div style={{marginTop: 'auto'}}>
           <div className="sidebar-item" onClick={() => {localStorage.clear(); nav("/");}}><span className="item-icon">🚪</span><span className="item-text">Logout</span></div>
        </div>
      </aside>

      {/* Project Nav */}
      <nav className="project-nav">
        <div className="nav-header">
           <div className="project-icon" style={{background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'}}>T</div>
           <div style={{overflow: 'hidden'}}>
             <div style={{fontWeight: 700, fontSize: '14px'}}>{currentTeam?.name || 'Loading...'}</div>
             <div style={{fontSize: '11px', color: 'var(--text-muted)'}}>Manage Your Tasks Like Ninja</div>
           </div>
        </div>
        <ul className="nav-links">
          <li className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>🚀 Kanban Board</li>
          <li className={view === 'backlog' ? 'active' : ''} onClick={() => setView('backlog')}>📜 Backlog</li>
          <li className={view === 'reports' ? 'active' : ''} onClick={() => setView('reports')}>📊 Reports</li>
          <li className={view === 'team' ? 'active' : ''} onClick={() => setView('team')}>👥 Team & Members</li>
        </ul>
      </nav>

      {/* Main Content */}
      <main className="jira-main">
        <header className="page-header" style={{paddingBottom: '0'}}>
          <div className="breadcrumbs">Projects / {currentTeam?.name} / {view.toUpperCase()}</div>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
             <h1 className="header-title">{view === 'board' ? 'Sprint Board' : view === 'backlog' ? 'Backlog Planning' : view === 'team' ? 'Manage Team' : 'Project Insights'}</h1>
             {view === 'board' && activeSprint && (
                <button className="jira-btn" style={{marginRight: '12px'}} onClick={() => handleCompleteSprint(activeSprint._id)}>Complete Sprint</button>
             )}
             {view !== 'reports' && view !== 'team' && <button className="jira-btn btn-blue" onClick={() => createTask("task", activeSprint?._id)}>Create Issue</button>}
          </div>
          
          {(view === 'board' || view === 'backlog') && (
            <div className="filters-row" style={{display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center'}}>
               <div style={{position: 'relative', flex: 1, maxWidth: '280px'}}>
                  <input className="auth-input" style={{background: 'white', paddingLeft: '32px'}} placeholder="Search issues..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                  <span style={{position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5}}>🔍</span>
               </div>
               <select className="jira-btn" style={{background: '#f4f5f7'}} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">Types</option>
                  <option value="task">Tasks</option>
                  <option value="bug">Bugs</option>
                  <option value="story">Stories</option>
               </select>
               <div className="avatar-group" style={{display: 'flex', marginLeft: 'auto'}}>
                  {currentTeam?.members?.slice(0, 4).map(m => <div key={m._id} className="avatar" title={m.email} style={{background: 'var(--primary)', border: '2px solid white', marginLeft: '-10px'}}>{m.email ? m.email[0].toUpperCase() : '?'}</div>)}
               </div>
            </div>
          )}
        </header>

        {loading ? (
          <div style={{padding: '100px', display: 'flex', justifyContent: 'center'}}><div className="jira-loader">Synchronizing workspace...</div></div>
        ) : (
          <div style={{flex: 1, overflow: 'auto', background: '#f4f5f7', paddingBottom: '40px'}}>
             {view === 'board' ? renderBoard() : view === 'backlog' ? renderBacklog() : view === 'team' ? renderTeam() : renderReports()}
          </div>
        )}
      </main>

      {/* Detail Slide-out Panel */}
      <aside ref={detailPanelRef} className="detail-panel">
        {selectedTask && (
          <div className="fade-in">
            <div className="detail-header">
              <select style={{border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer'}} value={editType} onChange={e => setEditType(e.target.value)}>
                <option value="task">📋</option><option value="bug">🐞</option><option value="story">📗</option>
              </select>
              <div style={{display: 'flex', gap: '8px'}}>
                 <button onClick={() => { if(window.confirm("Liquidate?")) { api.delete(`/tasks/${selectedTask._id}`); setTasks(tasks.filter(t => t._id !== selectedTask._id)); closeTaskDetail(); }}} style={{background: 'none', border: 'none', cursor: 'pointer'}}>🗑️</button>
                 <button onClick={closeTaskDetail} style={{background: 'none', border: 'none', cursor: 'pointer'}}>✖</button>
              </div>
            </div>
            
            <input className="detail-title" value={editTitle} onChange={e => setEditTitle(e.target.value)} style={{fontSize: '22px', border: '2px solid transparent'}} onFocus={e => e.target.style.borderColor = 'var(--primary)'} onBlur={e => e.target.style.borderColor = 'transparent'} />
            
            <div style={{display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginTop: '20px'}}>
               <div className="left-col">
                  <div className="detail-section">
                    <div className="section-label">Description</div>
                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{width: '100%', minHeight: '150px', border: '1px solid var(--border)', padding: '10px', fontSize: '14px'}} />
                  </div>
                  <button className="save-btn" onClick={handleSaveTask}>Save Objective</button>
               </div>
               <div className="right-col">
                  <div className="detail-section">
                    <div className="section-label">STATUS</div>
                    <select className="status-pill" style={{width: '100%', padding: '10px'}} value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                       <option value="todo">TO DO</option><option value="in-progress">IN PROGRESS</option><option value="done">DONE</option>
                    </select>
                  </div>
                  <div className="detail-section assignee-lookup">
                    <div className="section-label">ASSIGNEE (Email)</div>
                    <input className="auth-input" value={assigneeSearch} onChange={e => {setAssigneeSearch(e.target.value); setShowUserDropdown(true);}} />
                    {showUserDropdown && (
                      <div className="user-dropdown">
                        {currentTeam?.members.filter(u => u.email.includes(assigneeSearch)).map(u => (
                          <div key={u._id} className="user-option" onClick={() => { setEditAssignee(u); setAssigneeSearch(u.email); setShowUserDropdown(false); }}>{u.email}</div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="detail-section">
                    <div className="section-label">TEAM SPRINT</div>
                    <select className="jira-btn" style={{width: '100%', background: '#ebecf0'}} value={editSprint} onChange={e => setEditSprint(e.target.value)}>
                       <option value="">Move to Backlog</option>
                       {sprints.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
               </div>
            </div>
          </div>
        )}
      </aside>

      {/* Sprint Create Modal */}
      {showSprintModal && (
        <div className="auth-page" style={{position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 1000, background: 'rgba(0,0,0,0.5)'}}>
           <div className="auth-card">
              <h3>Create New Sprint</h3>
              <input className="auth-input" placeholder="Sprint Name (e.g. Sprint 2)" value={newSprintName} onChange={e => setNewSprintName(e.target.value)} style={{margin: '20px 0'}} />
              <div style={{display: 'flex', gap: '10px'}}>
                 <button className="auth-btn" onClick={handleCreateSprint}>Initialize</button>
                 <button className="auth-btn" style={{background: '#ebecf0', color: '#172b4d'}} onClick={() => setShowSprintModal(false)}>Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
