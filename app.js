var budgetController = (function() {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round(this.value / totalIncome * 100);
    }else{
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var budget = {
    items: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  var calculateSum = function(type) {
    var sum = 0;
    budget.items[type].forEach(a => {
      sum = sum + a.value;
    });
    budget.total[type] = sum;
    return sum;
  };

  return {
    addItem: function(type, description, value) {
      var id, newItem;
      if (budget.items[type].length === 0) {
        id = 1;
      } else {
        id = budget.items[type][budget.items[type].length - 1].id + 1;
      }
      switch (type) {
        case "inc":
          newItem = new Income(id, description, value);
          break;
        case "exp":
          newItem = new Expense(id, description, value);
          break;
        default:
      }
      budget.items[type].push(newItem);
      return newItem;
    },
    calculateBudget: function() {
      var totalExpense = calculateSum("exp");
      var totalIncome = calculateSum("inc");
      budget.budget = totalIncome - totalExpense;
      if (totalIncome > 0) {
        budget.percentage = Math.round(totalExpense / totalIncome * 100);
      } else {
        budget.percentage = -1;
      }
    },
    calculatePercentage: function() {
      budget.items.exp.forEach(a => a.calculatePercentage(budget.total.inc));
    },
    getPercentages: function() {
      var arrPercentage = budget.items.exp.map(a => a.getPercentage());
      return arrPercentage;
    },
    getBudget: function() {
      return {
        totalIncome: budget.total.inc,
        totalExpense: budget.total.exp,
        budget: budget.budget,
        percentage: budget.percentage
      };
    },
    deleteItem: function(type, id) {
      var idsArray = budget.items[type].map(a => a.id);
      var index = idsArray.indexOf(parseInt(id));
      if (index !== -1) {
        budget.items[type].splice(index, 1);
      }
    },
    test: function() {
      console.log(budget);
    }
  };
})();

var UIController = (function() {
  var DOMElements = {
    typeInput: ".add__type",
    descriptionInput: ".add__description",
    valueInput: ".add__value",
    addButton: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    expensesPercentage: ".budget__expenses--percentage",
    container: ".container",
    percentageslabel: ".item__percentage",
    dateLabel: ".budget__title--month"
  };
  //Private functions to be used in the UI controller
  var formatNumber = function(type, number) {
    number = Math.abs(number);
    number = number.toFixed(2);
    var numSplit = number.split(".");
    var int = numSplit[0];
    var dec = numSplit[1];
    if (int.length > 3) {
      int =
        int.substring(0, int.length - 3) +
        "," +
        int.substring(int.length - 3, int.length);
    }
    return (type === "inc" ? "+ " : "- ") + int + "." + dec;
  };

  //UI code goes here
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMElements.typeInput).value,
        description: document.querySelector(DOMElements.descriptionInput).value,
        value: document.querySelector(DOMElements.valueInput).value
      };
    },
    addListItem: function(obj, type) {
      var html;
      switch (type) {
        case "inc":
          html =
            '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div>' +
            '<div class="right clearfix">' +
            '<div class="item__value">%value%</div>' +
            '<div class="item__delete">' +
            '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
            "</div>" +
            "</div>" +
            "</div>";
          html = html
            .replace("%id%", obj.id)
            .replace("%description%", obj.description)
            .replace("%value%", formatNumber("inc", obj.value));
          document
            .querySelector(DOMElements.incomeContainer)
            .insertAdjacentHTML("beforeend", html);
          break;
        case "exp":
          html =
            '<div class="item clearfix" id="exp-%id%">' +
            '<div class="item__description">%description%</div>' +
            '<div class="right clearfix">' +
            '<div class="item__value">%value%</div>' +
            '<div class="item__percentage">21%</div>' +
            '<div class="item__delete">' +
            '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
            "</div>" +
            "</div>" +
            "</div>";
          html = html
            .replace("%id%", obj.id)
            .replace("%description%", obj.description)
            .replace("%value%", formatNumber("exp", obj.value));
          document
            .querySelector(DOMElements.expensesContainer)
            .insertAdjacentHTML("beforeend", html);
          break;
      }
    },
    removeListItem: function(id) {
      document
        .getElementById(id)
        .parentNode.removeChild(document.getElementById(id));
    },
    getDomElements: function() {
      return DOMElements;
    },
    clearFields: function() {
      var fieldsToClear = document.querySelectorAll(
        DOMElements.descriptionInput + ", " + DOMElements.valueInput
      );
      //convert the list to an array
      var fieldsArray = Array.prototype.slice.call(fieldsToClear);
      fieldsArray.forEach(domElement => {
        domElement.value = "";
      });
      fieldsArray[0].focus();
    },
    changeType: function(event) {
      document
        .querySelectorAll(
          DOMElements.typeInput +
            ", " +
            DOMElements.descriptionInput +
            ", " +
            DOMElements.valueInput
        )
        .forEach(a => a.classList.toggle("red-focus"));
      document.querySelector(DOMElements.addButton).classList.toggle("red");
    },
    displayBudget: function(obj) {
      var type = obj.budget > 0 ? "inc" : "exp";
      document.querySelector(
        DOMElements.budgetLabel
      ).textContent = formatNumber(type, obj.budget);
      document.querySelector(
        DOMElements.incomeLabel
      ).textContent = formatNumber("inc", obj.totalIncome);
      document.querySelector(
        DOMElements.expensesLabel
      ).textContent = formatNumber("exp", obj.totalExpense);
      if (obj.percentage > 0) {
        document.querySelector(DOMElements.expensesPercentage).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMElements.expensesPercentage).textContent =
          "---";
      }
    },
    displayPercentages: function(arrPercentages) {
      document
        .querySelectorAll(DOMElements.percentageslabel)
        .forEach((curr, index) => {
          var percentageValue = arrPercentages[index];
          if (percentageValue > 0) {
            curr.textContent = arrPercentages[index] + "%";
          } else {
            curr.textContent = "---";
          }
        });
    },
    displayMonth: function() {
      var now = new Date();
      var months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
      ];
      var month = now.getMonth();
      var year = now.getFullYear();
      document.querySelector(DOMElements.dateLabel).textContent =
        months[month] + ", " + year;
    }
  };
})();

var controller = (function(budgetCtrl, UICtrl) {
  var DOM = UICtrl.getDomElements();
  var init = function() {
    document
      .querySelector(DOM.addButton)
      .addEventListener("click", ctrlAdditem);

    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAdditem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.typeInput)
      .addEventListener("change", UICtrl.changeType);
    UICtrl.displayBudget({
      totalIncome: 0,
      totalExpense: 0,
      budget: 0,
      percentage: -1
    });
    UICtrl.displayMonth();
  };
  var updateBudget = function() {
    //Calculate budget
    budgetCtrl.calculateBudget();
    //Return budget
    var budget = budgetCtrl.getBudget();
    //Update UI
    UICtrl.displayBudget(budget);
  };

  var calculatePercentage = function() {
    budgetCtrl.calculatePercentage();
    var arrPercentages = budgetCtrl.getPercentages();
    UICtrl.displayPercentages(arrPercentages);
  };

  var ctrlDeleteItem = function(event) {
    var id = event.target.parentNode.parentNode.parentNode.parentNode.id;
    var splitIds = id.split("-");
    var type = splitIds[0];
    var itemId = splitIds[1];
    budgetCtrl.deleteItem(type, itemId);
    UICtrl.removeListItem(id);
    updateBudget();
    calculatePercentage();
  };

  var ctrlAdditem = function() {
    var input = UICtrl.getInput();
    if (input.description !== "" && input.value !== "" && !isNaN(input.value)) {
      var newItem = budgetCtrl.addItem(
        input.type,
        input.description,
        parseFloat(input.value)
      );
      UICtrl.addListItem(newItem, input.type);
      UICtrl.clearFields();
      updateBudget();
      calculatePercentage();
    }
  };

  return {
    init: init
  };
})(budgetController, UIController);

controller.init();
