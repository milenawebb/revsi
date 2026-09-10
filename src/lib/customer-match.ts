import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CustomerMatch = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
};

function useDebounced(value: string, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

const escape = (v: string) => v.replace(/[,()%]/g, " ").trim();

/**
 * Debounced lookup of existing customers for a business by typed name and email.
 * Returns up to three matches, exact email duplicates first.
 */
export function useCustomerMatches({
  businessId,
  name,
  email,
  enabled = true,
}: {
  businessId: string;
  name: string;
  email: string;
  enabled?: boolean;
}) {
  const debouncedName = useDebounced(name);
  const debouncedEmail = useDebounced(email);

  const nameQ = escape(debouncedName);
  const emailQ = escape(debouncedEmail);
  const active = enabled && (nameQ.length >= 2 || emailQ.length >= 3);

  const query = useQuery({
    queryKey: ["customer-match", businessId, nameQ, emailQ],
    enabled: active,
    queryFn: async () => {
      const filters: string[] = [];
      if (nameQ.length >= 2) filters.push(`name.ilike.%${nameQ}%`);
      if (emailQ.length >= 3) filters.push(`email.ilike.%${emailQ}%`);

      const { data, error } = await supabase
        .from("customers")
        .select("id, name, email, phone")
        .eq("business_id", businessId)
        .or(filters.join(","))
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as CustomerMatch[];
    },
  });

  const all = active ? (query.data ?? []) : [];
  const lowerEmail = emailQ.toLowerCase();
  const exact = all.filter((c) => (c.email ?? "").toLowerCase() === lowerEmail && lowerEmail);
  const rest = all.filter((c) => !exact.some((e) => e.id === c.id));

  return {
    matches: [...exact, ...rest].slice(0, 3),
    hasExactEmail: exact.length > 0,
    isFetching: query.isFetching,
  };
}
