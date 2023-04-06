const getContext = require("../../helpers/getContext");
const fetch = require("node-fetch");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(process.env.DATABASE_URI, process.env.DATABASE_SECRET);

module.exports = async (req, res) => {
  const { user, repo, options } = getContext(req);

  const response = await fetch(`https://api.github.com/repos/${user}/${repo}`, { headers: {} }).then((res) => res.json());

  if (!response?.id) {
    // ERROR
  }

  // Implement IP whitelist for GitHub IPs

  const { data: counter, error } = await supabase.rpc("update_repo_counter", { p_username: user, p_repo_name: repo });

  if (error) {
    // ERROR
  }

  res.redirect(`https://img.shields.io/badge/Visits-${counter}-brightgreen${options}`);
};
