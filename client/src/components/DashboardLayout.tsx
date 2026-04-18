import AuthPanel from "@/components/AuthPanel";
// (rest unchanged, replacing only unauthenticated block)

// find this block:
// if (!user) { ... }

// replace entire block with:

if (!user) {
  return <AuthPanel />;
}

// keep rest of file unchanged
