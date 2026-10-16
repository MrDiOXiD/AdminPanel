import { cookies } from "next/headers";
import { json } from "node:stream/consumers";


// Success is decided by the HTTP status, not the body: NestJS answers with an empty body
// when a handler returns void, and res.json() would throw on that.
const apiRequest = async (method, url, body) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Authorization token is required for this request.");

  const res = await fetch(`${process.env.API_URL}${url}`, {
    cache: "no-store",
    method,
    headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  let data = null;
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }
  return { ok: res.ok, status: res.status, data };
};


const getFetch = async (url) => {

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    throw new Error("Authorization token is required for this request.");
  }

  const res = await fetch(`${process.env.API_URL}${url}`, {
    cache: "no-store",
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });



  return await res.json();
};



const postFetch = async (url, body) => {
const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await fetch(`${process.env.API_URL}${url}`, {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify(body),
  });

  return await res.json();
};

const postFetchUnauth = async (url, body) => {
  const res = await fetch(`${process.env.API_URL}${url}`, {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });


  return await res.json();
};

const deleteFetch = async (url) => {
const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await fetch(`${process.env.API_URL}${url}`, {
    cache: "no-store",
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token.value}`,
    },
  });

  return await res.json();
};

const putFetch = async (url, body) => {
const cookieStore = await cookies();
const token = cookieStore.get("token");
  const res = await fetch(`${process.env.API_URL}${url}`, {
    cache: "no-store",
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token.value}`,
    },
    body: JSON.stringify(body),
  });

  return await res.json();
};

export { getFetch, postFetch, postFetchUnauth, deleteFetch, putFetch, apiRequest };
