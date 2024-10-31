const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";

document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

function addBook() {
  const judulBook = document.getElementById("inputBookTitle").value;
  const authorBook = document.getElementById("inputBookAuthor").value;
  const timestamp = Number(document.getElementById("inputBookYear").value);
  const isComplate = document.getElementById("inputBookIsComplete").checked;

  const generatedID = generateId();
  const bookObject = generateBookObject(
    generatedID,
    judulBook,
    authorBook,
    timestamp,
    isComplate
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplated) {
  return {
    id,
    title,
    author,
    year,
    isComplated,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  // console.log(localStorage.getItem(STORAGE_KEY));

  const incompletedBOOKList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompletedBOOKList.classList.add("shadow");
  incompletedBOOKList.innerHTML = "";

  const completeBOOKList = document.getElementById("completeBookshelfList");
  completeBOOKList.classList.add("shadow");
  completeBOOKList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplated) {
      incompletedBOOKList.append(bookElement);
    } else {
      completeBOOKList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const judulBook = document.createElement("h3");
  judulBook.innerText = bookObject.title;

  const authorBook = document.createElement("p");
  authorBook.innerText = "Penulis : " + bookObject.author;

  const timestamp = document.createElement("p");
  timestamp.innerText = "Tahun : " + bookObject.year;

  const textContainer = document.createElement("div");
  textContainer.classList.add("book_list");
  textContainer.append(judulBook, authorBook, timestamp);

  const container = document.createElement("article");
  container.classList.add("book_item");
  container.append(textContainer);
  container.setAttribute("id", `book-${bookObject.id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  if (bookObject.isComplated) {
    const undoButton = document.createElement("button");
    undoButton.classList.add("green");
    undoButton.innerText = "Belum diBaca";

    undoButton.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Tindakan ini tidak dapat dibatalkan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "green",
        cancelButtonColor: "red",
        confirmButtonText: "Ya, Belum dibaca",
      }).then((result) => {
        if (result.isConfirmed) {
          undoTaskFromCompleted(bookObject.id);
          Swal.fire("Kembali", "Kamu belum selesai membaca.", "warning");
        }
      });
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("red");
    removeButton.innerText = "Hapus Buku";

    removeButton.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Tindakan ini tidak dapat dibatalkan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "green",
        cancelButtonColor: "red",
        confirmButtonText: "Hapus",
      }).then((result) => {
        if (result.isConfirmed) {
          removeTaskFromCompleted(bookObject.id);
          Swal.fire("Terhapus!", "Data kamu telah dihapus.", "success");
        }
      });
    });

    buttonContainer.append(undoButton, removeButton);
    container.append(buttonContainer);
  } else {
    const checkButton = document.createElement("button");
    checkButton.classList.add("green");
    checkButton.innerText = "Selesai diBaca";

    checkButton.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Tindakan ini tidak dapat dibatalkan!",
        imageUrl: "hitam.gif", // Ubah ini sesuai dengan URL gambar yang ingin ditampilkan
        imageWidth: 200, // Atur lebar gambar jika diperlukan
        imageHeight: 200, // Atur tinggi gambar jika diperlukan
        imageAlt: "Custom Image",
        showCancelButton: true,
        confirmButtonColor: "green",
        cancelButtonColor: "red",
        confirmButtonText: "Ya, Selesai dibaca!",
      }).then((result) => {
        if (result.isConfirmed) {
          addTaskToCompleted(bookObject.id);
          Swal.fire("Berhasil", "Buku ini telah selesai dibaca.", "success");
        }
      });
    });

    const removeButton = document.createElement("button");
    removeButton.classList.add("red");
    removeButton.innerText = "Hapus Buku";

    removeButton.addEventListener("click", function () {
      Swal.fire({
        title: "Apakah kamu yakin?",
        text: "Tindakan ini tidak dapat dibatalkan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "green",
        cancelButtonColor: "red",
        confirmButtonText: "Hapus",
      }).then((result) => {
        if (result.isConfirmed) {
          removeTaskFromCompleted(bookObject.id);
          Swal.fire("Terhapus!", "Data kamu telah dihapus.", "success");
        }
      });
    });

    buttonContainer.append(checkButton, removeButton);
    container.append(buttonContainer);
  }

  return container;
}

function addTaskToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplated = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function removeTaskFromCompleted(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function undoTaskFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isComplated = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document
  .getElementById("searchSubmit")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const searchBook = document
      .getElementById("searchBookTitle")
      .value.toLowerCase();
    const bookList = document.querySelectorAll(".book_item h3");
    for (const book of bookList) {
      const bookTitle = book.innerText.toLowerCase();
      const bookContainer = book.parentElement.parentElement;

      if (bookTitle.includes(searchBook)) {
        bookContainer.style.display = "block";
      } else {
        bookContainer.style.display = "none";
      }
    }
  });
