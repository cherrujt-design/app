document.addEventListener('DOMContentLoaded',()=>{
  const form=document.getElementById('composer');
  const input=document.getElementById('msg');
  const messages=document.getElementById('messages');

  function addMessage(text, type='sent'){
    const el=document.createElement('div');
    el.className='message '+type;
    el.textContent=text;
    messages.appendChild(el);
    messages.scrollTop=messages.scrollHeight;
  }

  form.addEventListener('submit',e=>{
    e.preventDefault();
    const v=input.value.trim();
    if(!v) return;
    addMessage(v,'sent');
    input.value='';
    setTimeout(()=>addMessage('Auto-reply: received "'+v+'"','received'),700);
  });
});
