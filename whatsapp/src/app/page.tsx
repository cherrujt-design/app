"use client";

import React, { useEffect, useRef, useState } from "react";
import { auth, onAuthStateChanged, createOrUpdateUser, fetchUsers, listenToUsers, addMessage, listenToConversation, addUserByEmail, type FirebaseUser } from "./lib/firebase";

const EMOJIS = ["😀","😂","😍","👍","🙏","🎉","😅","😭","🔥","🤝","😉","😎"];

function convId(a: string, b: string) { return [a,b].sort().join("|"); }

export default function Page() {
  const [users, setUsers] = useState<any[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [me, setMe] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (u: FirebaseUser | null) => {
      if (u) {
        setMe(u.uid);
        await createOrUpdateUser(u);
      } else {
        setMe(null);
      }
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    const unsub = listenToUsers((us) => {
      setUsers(us as any[]);
      if (!current) {
        const others = (us as any[]).filter((x:any)=> x.id !== me);
        if (others.length) setCurrent(others[0].id);
      }
    });
    return () => unsub();
  }, [me, current]);

  useEffect(() => { // listen to messages for current convo
    if (!me || !current) { setMessages([]); return; }
    const unsub = listenToConversation(me, current, (msgs) => setMessages(msgs));
    return () => unsub();
  }, [me, current]);

  useEffect(() => { // scroll
    const el = messagesRef.current; if (!el) return; el.scrollTop = el.scrollHeight;
  }, [messages, current]);

  const contacts = users.filter(u => u.id !== me);
  const [friendEmail, setFriendEmail] = useState("");

  async function createAccount() {
    // account creation handled by Google login; fallback not implemented
  }

  async function addContact() {
    // legacy stub
  }

  async function addFriend() {
    const email = friendEmail.trim().toLowerCase();
    if (!email) return;
    try {
      const user = await addUserByEmail(email);
      // if user created/exists, open chat with them
      if (user && user.id) {
        setFriendEmail("");
        setCurrent(user.id);
      }
    } catch (e) {
      console.error('addFriend', e);
    }
  }

  async function sendMessage(msgText: string) {
    if (!msgText.trim() || !me || !current) return;
    await addMessage(me, current, msgText);
    setText("");
    setShowEmoji(false);
  }

  function onEmoji(e: string) { setText(t => t + e); }

  return (
    <div className="chat-app">
      <aside className="sidebar">
        <div className="account">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <strong>Account</strong>
            <div className="small">{me ? users.find(u=>u.id===me)?.displayName || users.find(u=>u.id===me)?.email : 'Not signed in'}</div>
          </div>
          <div className="small">Sign in with Google to create an account</div>
        </div>

        <div className="contacts">
          <strong>Contacts</strong>
          <div className="small">Click a contact to open chat</div>
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <input placeholder="friend's email" value={friendEmail} onChange={e=>setFriendEmail(e.target.value)} />
            <button onClick={addFriend}>Add Friend</button>
          </div>
          <div style={{marginTop:8}} className="contacts-list">
            {contacts.map((c:any) => (
              <div key={c.id} className={`contact-item ${c.id===current? 'contact-active':''}`} onClick={()=>setCurrent(c.id)}>
                <div style={{width:40,height:40,borderRadius:20,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {c.displayName?.[0]?.toUpperCase() || c.email?.[0]?.toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div><strong>{c.displayName || c.email}</strong></div>
                  <div className="small">{c.email}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <main className="chat-pane">
        <div style={{padding:12,borderBottom:'1px solid #eee',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:44,height:44,borderRadius:22,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {users.find(u=>u.id===current)?.displayName?.[0] || users.find(u=>u.id===current)?.email?.[0] || '?'}
          </div>
          <div>
            <div style={{fontWeight:700}}>{users.find(u=>u.id===current)?.displayName || users.find(u=>u.id===current)?.email || current}</div>
            <div className="small">{current}</div>
          </div>
        </div>

        <div className="messages" ref={messagesRef}>
          {messages.length===0 && <div className="small">No messages yet. Say hello!</div>}
          {messages.map((m:any,i)=> (
            <div key={m.id || i} className={`message ${m.from===me? 'me':'other'}`}>
              <div style={{fontSize:12,marginBottom:6,color:'#333'}}><strong>{m.from===me? 'You': users.find(u=>u.id===m.from)?.displayName || m.from}</strong></div>
              <div>{m.text}</div>
              <div className="small" style={{textAlign:'right',marginTop:6}}>{m.ts?.toDate ? m.ts.toDate().toLocaleTimeString() : ''}</div>
            </div>
          ))}
        </div>

        <div style={{position:'relative'}}>
          {showEmoji && (
            <div className="emoji-picker">
              {EMOJIS.map(e=> <button key={e} onClick={()=>onEmoji(e)} style={{fontSize:18,border:'none',background:'transparent',cursor:'pointer'}}>{e}</button>)}
            </div>
          )}
          <div className="composer">
            <button onClick={()=>setShowEmoji(s=>!s)} title="Emoji">😊</button>
            <input style={{flex:1}} placeholder="Type a message" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ sendMessage(text); } }} />
            <button onClick={()=>sendMessage(text)}>Send</button>
          </div>
        </div>
      </main>
    </div>
  );
}
