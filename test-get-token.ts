(async () => {
  try {
    const { getToken } = await import("next-auth/jwt");
    console.log("✅ getToken is of type:", typeof getToken);
  } catch (err) {
    console.error("❌ Failed to import getToken:", err);
  }
})();
