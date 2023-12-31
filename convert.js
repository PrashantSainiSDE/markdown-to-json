const fs = require("fs");

const mdFile = "dummy.md";

try {
  // check if file exist
  if (!fs.existsSync(mdFile)) {
    console.log("File not exist");
    process.exit(1);
  }

  // Read the file
  const mdData = fs.readFileSync(mdFile, "utf8");

  // Check if file is empty
  if (!mdData.trim()) {
    console.log("File is empty");
    process.exit(1);
  }

  // Table regex
  const tableVal = /\|(.+)\|((\r?\n)(\s*\|.+)+)*/g;

  // Check if table exist in file
  let tables = mdData.match(tableVal);

  if (!tables) {
    console.log("No table found");
    process.exit(1);
  }

  const requiredColumns = ["task_name", "task_description", "qty", "price"];
  const processTable = [];
  headers = [];
  
  tables.forEach((value) => {
    const array = value.split("|");
    // slugify data
    const slugifiedArray = array
    .map((value) => slugify(value.trim()))
    .filter(Boolean);
    
    //check if columns present in table
    const isPresent = requiredColumns.every((str) =>
    slugifiedArray.includes(str)
    );
    if (isPresent) {
      processTable.push(value);
      headers = slugifiedArray;
    }
  });
  
  const jsonResult = [];

  if (processTable) {
    processTable.forEach((table) => {
      const lines = table.trim().split("\n");
      const tableData = [];

      for (let i = 2; i < lines.length; i++) {
        const row = lines[i]
          .split("|")
          .map((cell) => cell.trim())
          .filter(Boolean);

        // Check if table have all columns
        if (row.length !== 4) {
          console.error("Empty table data");
          process.exit(1);
        }

        const rowData = {};

        for (let j = 0; j < headers.length; j++) {
          rowData[headers[j]] = row[j];
        }
        tableData.push(rowData);
      }
      jsonResult.push(tableData);
    });
  }

  // validation on QTY, price and add total field to json
  jsonResult[0].map((row) => {
    if (!validateQTY(row.qty)) {
      console.error("QTY is not an integer number");
      process.exit(1);
    }
    row.qty = parseInt(row.qty);
    row.price = parseFloat(row.price);
    row.total = row.qty + row.price;
  });

  // Convert data to JSON
  const jsonData = JSON.stringify(jsonResult, null, 2);

  // console JSON
  console.log(jsonData);

  // Write in a file
  // fs.writeFileSync("table.json",jsonData)
} catch (error) {
  // console error
  console.log(error);
}

// Slugify method
function slugify(text) {
  if (text.includes("&nbsp;")) {
    return text.toLowerCase().replace(/\s+/g, "&nbsp;");
  } else {
    return text.toLowerCase().replace(/\s+/g, "_");
  }
}

// validate QTY method
function validateQTY(QTY) {
  if (
    Number.isInteger(+QTY) &&
    parseInt(QTY) > 0 &&
    !String(QTY).includes(".")
  ) {
    return true;
  } else {
    return false;
  }
}
