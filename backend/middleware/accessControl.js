const LEVEL_PRIORITY = {
  L1: 1,
  L2: 2,
  L3: 3,
  L4: 4,
};

const ensureUserLoaded = (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Authentication required" });
    return false;
  }

  const level = req.user.level;
  if (!level || !LEVEL_PRIORITY[level]) {
    res.status(403).json({ error: "User level is not recognized" });
    return false;
  }

  return true;
};

const requireLevelAtLeast = (minimumLevel) => {
  return (req, res, next) => {
    if (!ensureUserLoaded(req, res)) {
      return;
    }

    const currentLevel = req.user.level;
    if (LEVEL_PRIORITY[currentLevel] < LEVEL_PRIORITY[minimumLevel]) {
      return res.status(403).json({ error: "Insufficient privileges" });
    }

    next();
  };
};

const allowLevels = (...levels) => {
  const allowedSet = new Set(levels);
  return (req, res, next) => {
    if (!ensureUserLoaded(req, res)) {
      return;
    }

    if (!allowedSet.has(req.user.level)) {
      return res
        .status(403)
        .json({ error: "Level not permitted for this action" });
    }

    next();
  };
};

const hasLevelAtLeast = (user, minimumLevel) => {
  if (!user || !user.level || !LEVEL_PRIORITY[user.level]) {
    return false;
  }
  return LEVEL_PRIORITY[user.level] >= LEVEL_PRIORITY[minimumLevel];
};

module.exports = {
  LEVEL_PRIORITY,
  requireLevelAtLeast,
  allowLevels,
  hasLevelAtLeast,
};
