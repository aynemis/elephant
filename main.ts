import * as readlineSync from 'readline-sync';
import Table from 'cli-table3';

const products = [
  { name: 'Produit A', price: 1000 },
  { name: 'Produit B', price: 5000 },
  { name: 'Produit C', price: 7000 },
  { name: 'Produit D', price: 10000 },
  { name: 'Produit E', price: 50000 }
];

const stateTaxes = {
  "UT": 6.85,
  "NV": 8,
  "TX": 6.25,
  "AL": 4,
  "CA": 8.25
};

const discounts = [
  { threshold: 50000, discountRate: 15 },
  { threshold: 10000, discountRate: 10 },
  { threshold: 7000, discountRate: 7 },
  { threshold: 5000, discountRate: 5 },
  { threshold: 1000, discountRate: 3 }
];

type StateCode = 'UT' | 'NV' | 'TX' | 'AL' | 'CA';

function displayProductsTable() {
  const table = new Table({
    head: ['#', 'Produit', 'Prix (€)'],
    colWidths: [5, 25, 15]
  });

  products.forEach((product, index) => {
    table.push([index + 1, product.name, product.price]);
  });

  console.log(table.toString());
}

function displayStatesTable() {
  const table = new Table({
    head: ['État', 'Taxe (%)'],
    colWidths: [15, 15]
  });

  Object.entries(stateTaxes).forEach(([state, tax]) => {
    table.push([state, tax]);
  });

  console.log(table.toString());
}

function displayCartTable(cart: { product: { name: string, price: number }, quantity: number }[]) {
  const table = new Table({
    head: ['Produit', 'Quantité', 'Prix HT (€)'],
    colWidths: [25, 15, 20]
  });

  cart.forEach(item => {
    table.push([item.product.name, item.quantity, (item.product.price * item.quantity).toFixed(2)]);
  });

  console.log(table.toString());
}

function calculateTotal(cart: { product: { name: string, price: number }, quantity: number }[], state: StateCode): number {
  let totalPrice = 0;

  cart.forEach(item => {
    const grossPrice = item.quantity * item.product.price;

    let discountRate = 0;
    for (const discount of discounts) {
      if (grossPrice >= discount.threshold) {
        discountRate = discount.discountRate;
        break;
      }
    }

    const discountedPrice = grossPrice * (1 - discountRate / 100);

    const taxRate = stateTaxes[state];
    const tax = discountedPrice * (taxRate / 100);
    totalPrice += discountedPrice + tax;
  });

  return totalPrice;
}

function manageCart() {
  const cart: { product: { name: string, price: number }, quantity: number }[] = [];
  let addingProducts = true;

  // Afficher la liste des produits
  displayProductsTable();

  // Ajouter des produits au panier
  while (addingProducts) {
    let productChoice: number;
    while (true) {
      productChoice = readlineSync.questionInt('Choisissez un produit en entrant le numéro correspondant : ') - 1;
      if (productChoice >= 0 && productChoice < products.length) {
        break;
      }
      console.log("Choix invalide, veuillez entrer un numéro valide.");
    }

    const selectedProduct = products[productChoice];

    let quantity: number;
    while (true) {
      quantity = readlineSync.questionInt('Entrez la quantité : ');
      if (quantity > 0) {
        break;
      }
      console.log("Quantité invalide, veuillez entrer un nombre positif.");
    }

    // Ajouter le produit au panier
    cart.push({ product: selectedProduct, quantity });
    console.log(`${selectedProduct.name} a été ajouté au panier.`);

    // Afficher le panier après chaque ajout
    console.log("\nPanier actuel :");
    displayCartTable(cart);

    const addMore = readlineSync.keyInYNStrict('Souhaitez-vous ajouter un autre produit ? (y/n) ');
    if (!addMore) {
      addingProducts = false;
    }
  }

  displayStatesTable();
  let state: StateCode;
  while (true) {
    state = readlineSync.question('Entrez l\'état de la commande (ex : UT) : ').toUpperCase() as StateCode;
    if (stateTaxes[state] !== undefined) {
      break;
    }
    console.log("État non valide, veuillez entrer un état valide.");
  }

  // Afficher le panier et le prix avec la TVA avant de valider
  console.log("\nPanier final :");
  displayCartTable(cart);

  const finalPrice = calculateTotal(cart, state);
  console.log(`Prix total avec la TVA : ${finalPrice.toFixed(2)} €`);

  const confirm = readlineSync.keyInYNStrict('Souhaitez-vous valider le panier ? (y/n) ');
  if (confirm) {
    console.log("Panier validé ! Merci pour votre achat.");
  } else {
    console.log("Panier annulé.");
  }
}

manageCart();
