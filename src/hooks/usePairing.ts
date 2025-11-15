import { useState } from "react";
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SUPABASE_KEY = SUPABASE_PUBLISHABLE_KEY;

async function callEdgeFunction(functionName: string, body?: any) {
  const sessionRes = await supabase.auth.getSession();
  const token = (sessionRes as any)?.data?.session?.access_token;

  if (!token) {
    const err: any = new Error('Authentication required. Please sign in and try again.');
    err.status = 401;
    throw err;
  }

  const res = await fetch(`${SUPABASE_URL}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : '',
      apikey: SUPABASE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed: any = null;
  try {
    parsed = text ? JSON.parse(text) : null;
  } catch (_e) {
    parsed = { message: text };
  }

  if (!res.ok) {
    const msg = parsed?.error || parsed?.message || `Function ${functionName} failed with status ${res.status}`;
    const err: any = new Error(msg);
    err.status = res.status;
    err.body = parsed;
    throw err;
  }

  return parsed;
}

async function callWithRetry(functionName: string, body?: any, retries = 3) {
  let attempt = 0;
  while (true) {
    try {
      return await callEdgeFunction(functionName, body);
    } catch (e: any) {
      attempt++;
      const status = e?.status ?? 0;
      const message = e?.message ?? '';
      const bodyErr = e?.body?.error ?? '';

      const isRetryableStatus = status >= 500 || status === 429;
      const isTransientError = /ECONNRESET|timed out|timeout|network/i.test(message);
      const isForeignKeyRace = /foreign key|violat/i.test(bodyErr.toString());

      const shouldRetry = attempt < retries && (isRetryableStatus || isTransientError || isForeignKeyRace);

      if (!shouldRetry) throw e;

      const backoff = 500 * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
}

export const usePairing = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generatePairingCode = async () => {
    setIsLoading(true);
    try {
      const data = await callWithRetry('generate-pairing-code');
      return data;
    } catch (error: any) {
      console.error('generatePairingCode error:', error);
      toast({
        title: "Error",
        description: error?.body?.error || error.message || "Failed to generate pairing code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const validatePairingCode = async (pairingCode: string) => {
    setIsLoading(true);
    try {
      const data = await callWithRetry('validate-pairing-code', { pairing_code: pairingCode });

      toast({
        title: "Success",
        description: "Pairing code validated. Waiting for child to accept.",
      });

      return data;
    } catch (error: any) {
      console.error('validatePairingCode error:', error);
      toast({
        title: "Error",
        description: error?.body?.error || error.message || "Invalid pairing code",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const acceptPairing = async (pairingId: string, permissions: any) => {
    setIsLoading(true);
    try {
      const data = await callWithRetry('accept-pairing', { pairing_id: pairingId, permissions });

      toast({
        title: "Success",
        description: "Pairing accepted successfully!",
      });

      return data;
    } catch (error: any) {
      console.error('acceptPairing error:', error);
      toast({
        title: "Error",
        description: error?.body?.error || error.message || "Failed to accept pairing",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    generatePairingCode,
    validatePairingCode,
    acceptPairing,
  };
};
