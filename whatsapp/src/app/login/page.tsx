"use client";

import React, { useEffect, useState } from "react";
import { auth, signInWithGoogle, onAuthStateChanged, type FirebaseUser } from "../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u));
    return () => unsub();
  }, []);

  async function handleGoogle() {
    try {
      await signInWithGoogle();
      router.push('/');
    } catch (e) { console.error(e); }
  }

  return (
    <div style={{padding:24,maxWidth:720,margin:'24px auto'}}>
      <h1>Login</h1>
      {user ? (
        <div>
          <p>Signed in as {user.displayName || user.email}</p>
          <p>Redirecting…</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          <button onClick={handleGoogle} style={{padding:12}}>Sign in with Google</button>
          <div className="small">After sign-in you'll be redirected to the app.</div>
        </div>
      )}
    </div>
  );
}
