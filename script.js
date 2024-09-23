// Sticky Navbar
window.addEventListener("load", function () {
  const navbar = document.getElementById("navbar");
  const placeholder = document.getElementById("navbar-placeholder");
  const titleSection = document.getElementById("home");

  if (!navbar) {
      console.error("Navbar element not found");
      return;
  }

  var stickyPoint = titleSection.offsetHeight;

  window.onscroll = function () {
      console.log("Current scroll position:", window.scrollY);
      console.log("Sticky point:", stickyPoint);

      if (window.scrollY >= stickyPoint) {
          navbar.classList.add("sticky");
          placeholder.style.height = navbar.offsetHeight + "px";
      } else {
          navbar.classList.remove("sticky");
          placeholder.style.height = "0";
      }
  };
});

// Navbar Collapse on Mobile
document.addEventListener('DOMContentLoaded', function () {
  var navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
  var navbarCollapse = document.querySelector('.navbar-collapse');

  navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
          if (window.getComputedStyle(navbarCollapse).getPropertyValue('display') !== 'none') {
              new bootstrap.Collapse(navbarCollapse).toggle();
          }
      });
  });

  // Search Bar Toggle
  const searchIcon = document.getElementById('search-icon');
  const searchInput = document.getElementById('search-input');

  searchIcon.addEventListener('click', function () {
      if (window.innerWidth <= 768) {
          if (searchInput.style.visibility === 'visible') {
              searchInput.style.width = '0';
              searchInput.style.padding = '0';
              searchInput.style.marginLeft = "0.5em"
              searchInput.style.border = 'none';
              searchInput.style.visibility = 'hidden';
              searchInput.style.display = "none";
          } else {
              searchInput.style.width = '5.5em';
              searchInput.style.border = '1px solid #ccc';
              searchInput.style.visibility = 'visible';
              searchInput.style.display = "block";
          }
      }
  });
});

// Product Carousel and Cart
document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.getElementById('fileInput');
  var filterBtn = document.getElementById('filter-btn');
  var searchInput = document.getElementById('search-input');
  var cartNumberContainer = document.querySelector('.cart-number-container');
  var cartItemsContainer = document.getElementById('cartItems');
  var cartTotalContainer = document.getElementById('cartTotal');
  var checkoutButton = document.getElementById('checkoutButton');
  var thankYouMessage = document.getElementById('thankYouMessage');

  var productsData = [];
  var cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (!Array.isArray(cart)) {
      cart = [];
  }

  // Fetch Products from JSON
  function fetchProducts() {
      fetch('products.json')
          .then(response => {
              if (!response.ok) {
                  throw new Error('Network response was not ok');
              }
              return response.json();
          })
          .then(data => {
              localStorage.setItem('products', JSON.stringify(data));
              productsData = data;
              displayProductsInCarousel(productsData);
          })
          .catch(error => {
              console.error('Fetch error:', error);
          });
  }

  // Call the function to fetch products
  fetchProducts();

  // Event Listeners
  fileInput.addEventListener('change', handleFileSelect);
  filterBtn.addEventListener('change', filterProducts);
  searchInput.addEventListener('input', searchProducts);

  function handleFileSelect(event) {
      var file = event.target.files[0];
      if (file) {
          var reader = new FileReader();
          reader.onload = function (e) {
              try {
                  var products = JSON.parse(e.target.result);
                  localStorage.setItem('products', JSON.stringify(products));
                  productsData = products;
                  displayProductsInCarousel(products);
              } catch (error) {
                  console.error('Error parsing JSON:', error);
              }
          };
          reader.readAsText(file);
      }
  }

  // Display Products in Carousel
  function displayProductsInCarousel(products) {
      var carouselInner = document.getElementById('carouselInner');
      carouselInner.innerHTML = '';

      var itemsPerSlide = 3;

      if (window.innerWidth <= 768) {
          itemsPerSlide = 1;
      }

      for (var i = 0; i < products.length; i += itemsPerSlide) {
          var carouselItem = document.createElement('div');
          carouselItem.classList.add('carousel-item');
          if (i === 0) {
              carouselItem.classList.add('active');
          }

          var row = document.createElement('div');
          row.classList.add('row');

          for (var j = i; j < i + itemsPerSlide && j < products.length; j++) {
              var product = products[j];

              var col = document.createElement('div');
              col.classList.add('col-md-4');

              col.innerHTML =
                  '<div class="card mb-4">' +
                  '<img src="' + product.image + '" class="card-img-top" alt="' + product.name + '">' +
                  '<div class="product-body">' +
                  '<h5 class="product-title">' + product.name + '</h5>' +
                  '<p class="product-text">' + product.description + '</p>' +
                  '<p class="product-text">Price: $' + product.price + '</p>' +
                  '<button class="btn btn-dark add-to-cart-btn" data-id="' + product.id + '">Add to Cart</button>' +
                  '</div>' +
                  '</div>';
              row.appendChild(col);
          }

          carouselItem.appendChild(row);
          carouselInner.appendChild(carouselItem);
      }

      var buttons = document.querySelectorAll('.add-to-cart-btn');
      Array.prototype.forEach.call(buttons, function (button) {
          button.addEventListener('click', function (event) {
              var productId = event.target.getAttribute('data-id');
              var product = products.find(function (p) {
                  return p.id == productId;
              });
              addToCart(product);
          });
      });
  }

  // Filter Products by Category
  function filterProducts() {
      var selectedCategory = filterBtn.value;
      var filteredProducts = productsData.slice();

      if (selectedCategory !== '0') {
          filteredProducts = filteredProducts.filter(function (product) {
              return product.category === selectedCategory;
          });
      }

      displayProductsInCarousel(filteredProducts);
  }

  // Search Products
  function searchProducts() {
      var searchTerm = searchInput.value.toLowerCase();
      var filteredProducts = productsData.slice();

      if (searchTerm.trim() !== '') {
          filteredProducts = filteredProducts.filter(function (product) {
              return product.name.toLowerCase().includes(searchTerm) || product.description.toLowerCase().includes(searchTerm);
          });
      }

      displayProductsInCarousel(filteredProducts);
  }

  // Add Products to Cart
  function addToCart(product) {
      var existingProduct = cart.find(function (item) {
          return item.id === product.id;
      });
      if (existingProduct) {
          existingProduct.quantity += 1;
      } else {
          var newProduct = {};
          for (var key in product) {
              newProduct[key] = product[key];
          }
          newProduct.quantity = 1;
          cart.push(newProduct);
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartDisplay();
  }

  // Update Cart Display
  function updateCartDisplay() {
      cartNumberContainer.textContent = cart.reduce(function (acc, item) {
          return acc + item.quantity;
      }, 0);

      cartItemsContainer.innerHTML = '';
      cart.forEach(function (item) {
          var cartItem = document.createElement('div');
          cartItem.classList.add('cart-item');
          cartItem.innerHTML =
              '<p>' + item.name + ' x ' + item.quantity + '</p>' +
              '<p>$' + (item.price * item.quantity).toFixed(2) + '</p>' +
              '<button class="decrease-quantity-btn" data-id="' + item.id + '">-</button>' +
              '<button class="increase-quantity-btn" data-id="' + item.id + '">+</button>' +
              '<button class="remove-item-btn" data-id="' + item.id + '">Remove</button>';
          cartItem.querySelector('.decrease-quantity-btn').addEventListener('click', function () {
              changeQuantity(item.id, -1);
          });
          cartItem.querySelector('.increase-quantity-btn').addEventListener('click', function () {
              changeQuantity(item.id, 1);
          });
          cartItem.querySelector('.remove-item-btn').addEventListener('click', function () {
              removeFromCart(item.id);
          });
          cartItemsContainer.appendChild(cartItem);
      });

      var total = cart.reduce(function (acc, item) {
          return acc + item.price * item.quantity;
      }, 0);
      cartTotalContainer.innerHTML = 'Total: $' + total.toFixed(2);
  }

  // Change Cart Quantity
  function changeQuantity(productId, change) {
      var product = cart.find(function (item) {
          return item.id === productId;
      });
      if (product) {
          product.quantity += change;
          if (product.quantity <= 0) {
              removeFromCart(productId);
          } else {
              localStorage.setItem('cart', JSON.stringify(cart));
              updateCartDisplay();
          }
      }
  }

  // Remove Item from Cart
  function removeFromCart(productId) {
      cart = cart.filter(function (item) {
          return item.id !== productId;
      });
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartDisplay();
  }

  // Checkout and Show Thank You Message
  checkoutButton.addEventListener('click', function () {
      cart = [];
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartDisplay();
      showThankYouMessage();
  });

  function showThankYouMessage() {
      thankYouMessage.classList.remove('d-none');
      setTimeout(function () {
          thankYouMessage.classList.add('d-none');
      }, 3000);
  }

  // Load Products from Local Storage
  var storedProducts = JSON.parse(localStorage.getItem('products'));
  if (storedProducts) {
      productsData = storedProducts;
      displayProductsInCarousel(productsData);
  }

  updateCartDisplay();
});
