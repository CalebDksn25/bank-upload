document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Content Loaded");

  // Retrieve the LLM data from localStorage
  const llmData = localStorage.getItem("llmData");
  const investment_strategy = localStorage.getItem("investment_strategy"); // Changed key to "investment_strategy"

  console.log("Retrieved data:", { llmData, investment_strategy });

  if (llmData) {
    const data = JSON.parse(llmData);
    console.log("Parsed data:", data);
    const wealthScore = data.wealth_health;

    // Update the Wealth Score display
    const wealthScoreDisplay = document.getElementById("Wealth-Score");
    wealthScoreDisplay.innerHTML = `<strong>Score:</strong> ${wealthScore}`;

    // Rotate new needle based on wealthScore
    const needle = document.getElementById("wealthNeedle");
    const rotation = (wealthScore / 100) * 180;
    if (needle) {
      needle.style.transform = `rotate(${rotation}deg)`;
    }

    // Display Investment Strategy
    if (investment_strategy) {
      const investmentType = document.getElementById("Investment-Type");
      const formattedStrategy = investment_strategy
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      investmentType.innerHTML = `
            <strong>Investment Strategy:</strong><br>
            <span style="color: #2c3e50; font-size: 1.1em;">${formattedStrategy}</span>
        `;
    }

    // Display Suggested Monthly Savings
    const monthlySavings = document.getElementById("Monthly-Savings");
    monthlySavings.innerHTML = `<strong>Suggested Monthly Savings:</strong> $${data.monthly_savings}`;

    // Display Top Expenses
    const topExpensesList = document.getElementById("top-expenses");
    if (topExpensesList) {
      // Clear existing content
      topExpensesList.innerHTML = "";

      if (data.top_expenses && data.top_expenses.length > 0) {
        data.top_expenses.forEach((expense, index) => {
          const li = document.createElement("li");
          li.textContent = `${index + 1}. ${expense}`;
          topExpensesList.appendChild(li);
        });
      } else {
        const li = document.createElement("li");
        li.textContent = "No expenses found";
        topExpensesList.appendChild(li);
      }
    }

    // Display Investment Advice
    const investmentAdvice = document.getElementById("data-display");
    investmentAdvice.innerHTML = `<strong>Investment Advice:</strong> ${data.investment_advice}`;

    // Display Money Change with all financial details
    const moneyChange = data.money_change;
    const [netChange] = Array.isArray(moneyChange)
      ? moneyChange
      : String(moneyChange)
          .split(",")
          .map((num) => Number(num.trim()));

    const moneyChangeDisplay = document.getElementById("Money-Change");
    const color = netChange < 0 ? "red" : "green";

    moneyChangeDisplay.innerHTML = `
        <strong>Financial Summary:</strong><br>
        <span style="color: ${color}">Net Change: $${netChange?.toLocaleString()}</span><br>
    `;
  } else {
    console.log("No llmData found in localStorage");
  }

  // Gauge Interaction (Commented Out)

  const needleElem = document.getElementById("arrow");
  const counterElem = document.getElementById("counter");
  const testParam = document.getElementById("testParam");

  if (testParam) {
    testParam.addEventListener("input", function () {
      const value = this.value;
      const rotation = (value / 100) * 66 - 33; // Map 0-100 to -33 to +33 degrees based on gauge span
      needleElem.style.transform = `rotate(${rotation}deg)`;
      counterElem.textContent = value;

      // Update the Wealth Score display when slider is used
      const wealthScoreDisplay = document.getElementById("Wealth-Score");
      wealthScoreDisplay.innerHTML = `${value}`;
    });

    // Initialize gauge position
    const initialValue = testParam.value;
    const initialRotation = (initialValue / 100) * 66 - 33;
    needleElem.style.transform = `rotate(${initialRotation}deg)`;
    counterElem.textContent = initialValue;

    // Initialize Wealth Score display
    const wealthScoreDisplay = document.getElementById("Wealth-Score");
    wealthScoreDisplay.innerHTML = `<strong>Score:</strong> ${initialValue}`;
  }
});
