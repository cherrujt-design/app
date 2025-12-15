"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, onAuthStateChanged, signInWithGoogle, signOutUser, type FirebaseUser } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  async function handleLogin() {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (e) {
      console.error('login', e);
    }
  }

  async function handleLogout() {
    await signOutUser();
    router.push('/login');
  }

  return (
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,borderBottom:'1px solid #eee'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link href="/" style={{fontWeight:700}}>Vibe</Link>
      </div>

      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {!user && <>
          <Link href="/login">Login</Link>
          <button onClick={handleLogin}>Sign in with Google</button>
        </>}

        {user && (
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:36,height:36,borderRadius:18,background:'#ddd',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
            <div style={{display:'flex',flexDirection:'column'}}>
              <div style={{fontSize:14,fontWeight:600}}>{user.displayName || user.email}</div>
              <div style={{fontSize:12,color:'#666'}}>{user.email}</div>
            </div>
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
}
