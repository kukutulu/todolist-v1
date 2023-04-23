const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const day = date.getDate();

main().catch((err) => {
  console.log(err);
});

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "You not name the task"],
  },
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Welcome to todolist!",
});

const item2 = new Item({
  name: "Hit the + button to add new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  list: String,
  items: [itemSchema],
};

const List = mongoose.model("List", listSchema);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  Item.find().then((foundItems) => {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems)
        .then(() => {
          console.log("Success saved default items to DB");
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", taskList: foundItems });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    Item.create({ name: itemName })
      .then(() => {
        console.log("Success add: " + itemName);
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOne({ list: listName })
      .then((foundList) => {
        foundList.items.push(item);
        foundList.save();
        console.log("Success add: " + itemName);
        res.redirect("/" + listName);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.post("/delete", (req, res) => {
  const listName = req.body.listName;
  const checkedItemId = req.body.checkbox;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then((result) => {
        console.log("Delete item : " + result.name);
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.updateMany(
      { list: listName },
      { $pull: { items: { _id: checkedItemId } } }
    )
      .then((result) => {
        console.log("Delete item: " + result);
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/" + listName);
  }
});

// app.get("/home", (req, res) => {
//   List.find().then((foundItems) => {
//     res.render("home", { foundLists: foundItems });
//   });
// });

app.get("/:customList", (req, res) => {
  // prevent create a list and a non capitalize version (eg: Home != home)
  const customList = capitalizeFirstLetter(req.params.customList);

  List.findOne({ list: customList }).then((foundList) => {
    if (!foundList) {
      // Create a new list
      List.create({ list: customList, items: defaultItems })
        .then((result) => {
          console.log(result);
        })
        .catch((err) => {
          console.log(err);
        });
      res.redirect("/" + customList);
    } else {
      // Show existing list
      res.render("list", {
        listTitle: foundList.list,
        taskList: foundList.items,
      });
    }
  });
});

app.listen(3000, () => {
  console.log(`App listening on port 3000!`);
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/todolistDB");
  console.log("Connected to database");
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
