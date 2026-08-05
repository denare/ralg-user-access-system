"use client";

import { useEffect, useState } from "react";
import { ActionPopup } from "@/components/action-popup";

export const REQUEST_ACTION_SUCCESS_KEY = "request-action-success";

export function RequestActionNotice() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedMessage = sessionStorage.getItem(REQUEST_ACTION_SUCCESS_KEY);
    if (!storedMessage) return;

    setMessage(storedMessage);
    sessionStorage.removeItem(REQUEST_ACTION_SUCCESS_KEY);
  }, []);

  if (!message) return null;

  return <ActionPopup message={message} onClose={() => setMessage("")} />;
}
