"use strict";

module.exports = function getBudgetStatus() {
  return {
    dailyTarget: "$2-3",
    monthlyTarget: "$60-90",
    routineOutputTarget: "500-800",
    complexOutputTarget: "1500-2500",
    note: "Static policy targets for now. Wire provider usage APIs or local spend logs for live token tracking.",
  };
};
