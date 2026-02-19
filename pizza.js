const pizzaData = {
    sizes: [
        { id: 1, nev: "Kicsi", meret: "S", ar: 0 },
        { id: 2, nev: "Közepes", meret: "M", ar: 800 },
        { id: 3, nev: "Nagy", meret: "L", ar: 1500 }
    ],

    basePrice: 2000,

    sauces: [
        { id: 1, nev: "Paradicsomos", ar: 300 },
        { id: 2, nev: "Tejfölös", ar: 400 }
    ],

    toppings: [
        { id: 1, nev: "Sajt", ar: 500 },
        { id: 2, nev: "Sonka", ar: 600 },
        { id: 3, nev: "Gomba", ar: 450 }
    ]
};


const sizesDiv = document.getElementById('sizes');
const saucesDiv = document.getElementById('sauces');
const toppingsDiv = document.getElementById('toppings');
const quantityInput = document.getElementById('quantity');
const priceSpan = document.getElementById('price');
const orderBtn = document.getElementById('orderBtn');
const clearBtn = document.getElementById('clearBtn');
const summaryEl = document.getElementById('summary');


function buildUI(){
    pizzaData.sizes.forEach(s=>{
        const id = `size-${s.id}`;
        const row = document.createElement('label'); row.className='item-row';
        row.innerHTML = `<input type="radio" name="size" id="${id}" value="${s.id}"> ${s.nev} (+${s.ar} Ft)`;
        sizesDiv.appendChild(row);
    });

    const firstSize = document.querySelector('input[name="size"]');
    if(firstSize) firstSize.checked = true;

    pizzaData.sauces.forEach(s=>{
        const id = `sauce-${s.id}`;
        const row = document.createElement('label'); row.className='item-row';
        row.innerHTML = `<input type="radio" name="sauce" id="${id}" value="${s.id}"> ${s.nev} (+${s.ar} Ft)`;
        saucesDiv.appendChild(row);
    });

    pizzaData.toppings.forEach(t=>{
        const id = `topping-${t.id}`;
        const row = document.createElement('label'); row.className='item-row';
        row.innerHTML = `<input type="checkbox" name="topping" id="${id}" value="${t.id}"> ${t.nev} (+${t.ar} Ft)`;
        toppingsDiv.appendChild(row);
    });

    document.querySelectorAll('input').forEach(i=>i.addEventListener('change', updatePrice));
    quantityInput.addEventListener('input', updatePrice);
    orderBtn.addEventListener('click', handleOrder);
    clearBtn.addEventListener('click', clearForm);

    updatePrice();
}


function calculateTotal(){
    const q = Math.max(1, parseInt(quantityInput.value) || 1);

    const sizeId = parseInt((document.querySelector('input[name="size"]:checked')||{}).value || pizzaData.sizes[0].id);
    const size = pizzaData.sizes.find(s=>s.id===sizeId);

    const sauceId = parseInt((document.querySelector('input[name="sauce"]:checked')||{}).value || 0);
    const sauce = pizzaData.sauces.find(s=>s.id===sauceId) || null;

    const toppingIds = Array.from(document.querySelectorAll('input[name="topping"]:checked')).map(i=>parseInt(i.value));
    const toppings = pizzaData.toppings.filter(t=>toppingIds.includes(t.id));

    const toppingsSum = toppings.reduce((a,b)=>a+b.ar,0);

    const unitPrice = pizzaData.basePrice + (size?size.ar:0) + (sauce?sauce.ar:0) + toppingsSum;
    const total = unitPrice * q;

    return { unitPrice, total, q, size, sauce, toppings };
}


function updatePrice(){
    const calc = calculateTotal();
    priceSpan.textContent = calc.total;
}


function handleOrder(){
    if(orderBtn.disabled) return;
    orderBtn.disabled = true;
    setTimeout(()=>orderBtn.disabled = false, 600);

    const calc = calculateTotal();
    if(!calc.sauce){
        summaryEl.innerHTML = `<div class="error">Hiba: válassz szószt!</div>`;
        return;
    }

    const orderObj = {
        date: new Date().toLocaleString(),
        size: calc.size ? calc.size.nev : null,
        sauce: calc.sauce ? calc.sauce.nev : null,
        toppings: calc.toppings.map(t=>t.nev),
        quantity: calc.q,
        unitPrice: calc.unitPrice,
        totalPrice: calc.total
    };

    
    const toppingsHtml = orderObj.toppings.length ? `<ul class="summary-list">${orderObj.toppings.map(t=>`<li>${t}</li>`).join('')}</ul>` : `<div class="muted">Nincs feltét</div>`;

    summaryEl.innerHTML = `
        <div class="summary-header"><strong>Rendelés:</strong> <span class="muted">${orderObj.date}</span></div>
        <div class="summary-row"><strong>Méret:</strong> <span>${orderObj.size}</span></div>
        <div class="summary-row"><strong>Szósz:</strong> <span>${orderObj.sauce}</span></div>
        <div class="summary-row"><strong>Feltétek:</strong> ${toppingsHtml}</div>
        <div class="summary-row"><strong>Darabszám:</strong> <span>${orderObj.quantity}</span></div>
        <div class="summary-row summary-price"><strong>Egységár:</strong> <span>${orderObj.unitPrice} Ft</span></div>
        <div class="summary-row summary-price"><strong>Végösszeg:</strong> <span class="total">${orderObj.totalPrice} Ft</span></div>
        <div class="summary-footer">Köszönjük a rendelést!</div>
    `;
}

function clearForm(){
    document.getElementById('pizzaForm').reset();
    const firstSize = document.querySelector('input[name="size"]');
    if(firstSize) firstSize.checked = true;
    updatePrice();
    summaryEl.innerHTML = `<div class="empty">Nincs rendelés.</div>`;
}


buildUI();


window.calculateTotal = calculateTotal;
