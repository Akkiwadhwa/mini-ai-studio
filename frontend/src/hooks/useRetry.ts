export const sleep = (ms:number)=>new Promise(r=>setTimeout(r,ms));
export async function withRetries<T>(fn:()=>Promise<T>, max=3, base=400):Promise<T>{
  let i=0; for(;;){ try{ return await fn(); } catch(e){ if(++i>=max) throw e; await sleep(base*Math.pow(2,i-1)); } }
}
