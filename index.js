
const EMPTY_HEART = '♡'
const FULL_HEART = '♥'

// Number of input elements to search meals
let condCnt = 0;    

// It is to store lists of options for input elements to search meals.
// index 0: Meal Category, 1: Area, 2: ingredients
const arrConditionDL = [];

// It is to save list of favorite meals so that don't need to fetch every time this list is needed.
const arrFavoriteMeals = [];

fetchSearchConditions();
addSearchElements();
fetchFavoriteMeals();

document.getElementById('search-meals').addEventListener('submit', e => {
    e.preventDefault();

    const arrSearchConditions = [];
    for (let i = 0; i < condCnt; i++) {
        const sltTag = document.getElementById(`select${i}`);
        const inputTag = document.getElementById(`input${i}`);
        arrSearchConditions.push({select: sltTag.value, input: inputTag.value});
    }
    // console.log(arrSearchConditions);

    searchMeals(arrSearchConditions, [], true);

    // initialzing search html elements
    document.getElementById('search-conditions').innerHTML = '';
    condCnt = 0;
    addSearchElements();
});

function fetchSearchConditions() {
    // fetching meal category data list
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list')
    .then(resp => resp.json())
    .then(mealCategory => {
        // console.log(mealCategory.meals);
        arrConditionDL[0] = mealCategory.meals.map(objCategory => objCategory.strCategory);
    });

    // fetching area data list
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list')
    .then(resp => resp.json())
    .then(area => {
        // console.log(area.meals);
        arrConditionDL[1] = area.meals.map(objArea => objArea.strArea);
    });

    // fetching ingredients data list
    fetch('https://www.themealdb.com/api/json/v1/1/list.php?i=list')
    .then(resp => resp.json())
    .then(ingredients => {
        // console.log(ingredients.meals);
        arrConditionDL[2] = ingredients.meals.map(objIngredient => objIngredient.strIngredient);
    });

    // console.log('arrConditionDL', arrConditionDL);
}

function addSearchElements() {
    const sltTag = document.createElement('select');
    sltTag.id = `select${condCnt}`;
    const optTag1 = document.createElement('option');
    optTag1.value = '0';
    optTag1.textContent = 'Choose one';
    const optTag2 = document.createElement('option');
    optTag2.value = '1';
    optTag2.textContent = 'Name';
    const optTag3 = document.createElement('option');
    optTag3.value = '2';
    optTag3.textContent = 'Meal Category';
    const optTag4 = document.createElement('option');
    optTag4.value = '3';
    optTag4.textContent = 'Area';
    const optTag5 = document.createElement('option');
    optTag5.value = '4';
    optTag5.textContent = 'Ingredient';
    sltTag.append(optTag1, optTag2, optTag3, optTag4, optTag5);
    sltTag.value = '0';
    sltTag.addEventListener('change', mkDataList);

    const dlTag = document.createElement('datalist');
    dlTag.id = `datalist${condCnt}`;

    const inputTag = document.createElement('input');
    inputTag.type = 'text';
    inputTag.name = `condition${condCnt}`;
    inputTag.id = `input${condCnt}`;
    inputTag.setAttribute('list', `datalist${condCnt}`);

    const btnTag = document.createElement('button');
    btnTag.type = 'button';
    btnTag.textContent = '+';
    btnTag.addEventListener('click', addSearchElements);

    const brTag = document.createElement('br');

    const divTag = document.getElementById('search-conditions');
    divTag.append(sltTag, inputTag, dlTag, btnTag, brTag);
    condCnt++;
}

function mkDataList(e) {
    const condNum = e.target.id.slice(6);
    //console.log('condNum', condNum);
    const dlTag = document.getElementById(`datalist${condNum}`);
    //console.log('dlTag', dlTag);
    dlTag.innerHTML = '';
    const sltTagValue = e.target.value;
    if (sltTagValue >= 2) {
        arrConditionDL[e.target.value - 2].forEach(elem => {
            const opTag = document.createElement('option');
            opTag.value = elem;
            dlTag.appendChild(opTag);
        });
    }
}

function searchMeals(arrSearchConditions, arrSearchedMeals, bFirst) {
    if (arrSearchConditions.length <= 0) {
        if (arrSearchedMeals.length === 0) {
            alert("Can't find any matching result.");
        } else {
            displaySearchedMeals(arrSearchedMeals);
        }
        return;
    } 

    const objSearchCondition = arrSearchConditions.pop();
    let srchCond = '';
    let srchUrl = 'https://www.themealdb.com/api/json/v1/1/';
    switch(objSearchCondition.select) {
        case '1':
            srchUrl = `${srchUrl}search.php?s=${objSearchCondition.input}`;
            srchCond = 'Name';
            break;
        case '2':
            srchUrl = `${srchUrl}filter.php?c=${objSearchCondition.input}`;
            srchCond = 'Meal Category';
            break;
        case '3':
            srchUrl = `${srchUrl}filter.php?a=${objSearchCondition.input}`;
            srchCond = 'Area';
            break;
        case '4':
            srchUrl = `${srchUrl}filter.php?i=${objSearchCondition.input}`;
            srchCond = 'Ingredient';
            break;
        default:
            alert('Please, add condition to get a search result.');
            return;
    }

    fetch(srchUrl)
    .then(resp => resp.json())
    .then(meals => {
        // console.log('meals.meals', meals.meals);

        if (meals.meals !== null) {
            if (bFirst) {
                arrSearchedMeals.splice(0, 0, ...meals.meals);
            } else {
                findIntersection(arrSearchedMeals, meals.meals);
            }
        } else {
            alert(`"${srchCond}": "${objSearchCondition.input}" is not valid!`)
        }
        // console.log(arrSearchedMeals);

        searchMeals(arrSearchConditions, arrSearchedMeals, false);
    })
    .catch(error => console.log(error));
}

function findIntersection(arr1, arr2) {
    let arrIds1 = arr1.map(elem => elem.idMeal);
    let arrIds2 = arr2.map(elem => elem.idMeal);
    
    let arrIdsIter, arrIdsSet, arrIter;
    if (arrIds1.length <= arrIds2.length) {
        arrIdsIter = arrIds1;
        arrIter = arr1;
        arrIdsSet = new Set(arrIds2);
    } else {
        arrIdsIter = arrIds2;
        arrIter = arr2;
        arrIdsSet = new Set(arrIds1);
    }

    const arrIdsIntersection = arrIdsIter.filter(id => arrIdsSet.has(id));
    // console.log('arrIdsIntersection', arrIdsIntersection)

    const arrRes = arrIdsIntersection.map(id => arrIter.find(obj => obj.idMeal === id));
    // console.log('arrRes', arrRes);
    arr1.splice(0, arr1.length, ...arrRes);
}

function displaySearchedMeals(arrSearchedMeals) {
    const ulMeals = document.getElementById('searched-meal-list');
    ulMeals.innerHTML = '';
    arrSearchedMeals.forEach(objMeal => {
        const imgMeal = document.createElement('img');
        imgMeal.src = objMeal.strMealThumb;
        imgMeal.alt = objMeal.strMeal;
        imgMeal.width = '30';
        imgMeal.height = '30';
        imgMeal.classList.add('img-thumbnail');

        const liMeal = document.createElement('li');
        liMeal.appendChild(imgMeal);
        // console.log('liMeal', liMeal, liMeal.innerHTML);
        liMeal.innerHTML = `${liMeal.innerHTML} ${objMeal.strMeal}`;
        liMeal.classList.add('pointer');

        liMeal.addEventListener('click', e => displayMealDesc(objMeal.idMeal, false));
        ulMeals.appendChild(liMeal);
    });
}

function displayMealDesc(id, bFromFavorites) {
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
    .then(resp => resp.json())
    .then(mealDesc => {
        const objMealDesc = mealDesc.meals[0];
        // console.log(objMealDesc);

        const imgMeal = document.createElement('img');
        imgMeal.src = objMealDesc.strMealThumb;
        imgMeal.alt = objMealDesc.strMeal;
        imgMeal.width = '300';
        imgMeal.height = '300';
        imgMeal.style.display = 'block';
        imgMeal.style.marginLeft = 'auto';
        imgMeal.style.marginRight = 'auto';
        
        const ulMealDesc = document.createElement('ul');
        const liStrMeal = document.createElement('li');
        liStrMeal.textContent = `Name: ${objMealDesc.strMeal}`;
        liStrMeal.id = 'display-meal-desc-strmeal';
        const liCategory = document.createElement('li');
        liCategory.textContent = `Category: ${objMealDesc.strCategory}`;
        const liArea = document.createElement('li');
        liArea.textContent = `Origin: ${objMealDesc.strArea}`;
        const liInstructions = document.createElement('li');
        liInstructions.textContent = `Instructions: ${objMealDesc.strInstructions}`;

        const ulIngredients = document.createElement('ul');
        for (let i = 1; i <= 20 && objMealDesc[`strIngredient${i}`] !== null && objMealDesc[`strIngredient${i}`] !== ''; i++) {
            // console.log(`strIngredient${i}: `, objMealDesc[`strIngredient${i}`], objMealDesc[`strIngredient${i}`] !== '');
            const liIngredient = document.createElement('li');
            liIngredient.textContent = objMealDesc[`strIngredient${i}`];
            ulIngredients.appendChild(liIngredient);
        }
        const liIngredients = document.createElement('li');
        liIngredients.textContent = "Ingredients: ";

        ulMealDesc.append(liStrMeal, liCategory, liArea, liInstructions, liIngredients, ulIngredients);

        const ftFavorite = document.createElement('footer');
        const ulFavorite = document.createElement('ul');
        const liFavorite = document.createElement('li');
        const spHeart = document.createElement('span');
        spHeart.id = 'heart';
        spHeart.classList.add('pointer');

        if (bFromFavorites) {
            spHeart.textContent = FULL_HEART;
            spHeart.classList.add('activated-heart');
        } else {
            const stFavoriteMealsId = new Set(arrFavoriteMeals.map(objMeal => objMeal.id));
            if (stFavoriteMealsId.has(id)) {
                spHeart.textContent = FULL_HEART;
                spHeart.classList.add('activated-heart');
            } else {
                spHeart.textContent = EMPTY_HEART;
            }
        }

        spHeart.addEventListener('click', e => {
            //console.log(e);
            if (e.target.textContent === EMPTY_HEART) {
                e.target.textContent = FULL_HEART;
                e.target.classList.toggle('activated-heart');
                addFavoriteMeal(objMealDesc);
            } else {
                e.target.textContent = EMPTY_HEART;
                e.target.classList.toggle('activated-heart');
                deleteFavoriteMeal(objMealDesc.idMeal);
            }
        });
        liFavorite.innerHTML = 'Add to favorite: ';
        liFavorite.append(spHeart);
        ulFavorite.append(liFavorite);
        ftFavorite.append(ulFavorite);

        const divMealDesc = document.getElementById('display-meal-desc');
        divMealDesc.innerHTML = '';
        divMealDesc.append(imgMeal, ulMealDesc, ftFavorite);
    })
    .catch(error => console.log(error));
}

function addFavoriteMeal(objMealDesc) {
    fetch(`http://localhost:3000/favoriteMeals`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            'id': objMealDesc.idMeal,
            'strMeal': objMealDesc.strMeal,
            'strMealThumb' : objMealDesc.strMealThumb,
        }),
    })
    .then(resp => resp.json())
    .then(objMeal => {
        // console.log('POST: ', objMeal);
        arrFavoriteMeals.push(objMeal);
        // console.log('addFavoriteMeal', arrFavoriteMeals);
        displayFavoriteMeals();
    })
    .catch(error => console.log(error));
}

function deleteFavoriteMeal(idMeal) {
    fetch(`http://localhost:3000/favoriteMeals/${idMeal}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    })
    .then(resp => resp.json())
    .then(objMeal => {
        //console.log('DELETE: ', objMeal);
        for (let i = 0; i < arrFavoriteMeals.length; i++) {
            if (arrFavoriteMeals[i].id === idMeal) {
                arrFavoriteMeals.splice(i, 1);
                break;
            }
        }
        // console.log('deleteFavoriteMeal', arrFavoriteMeals);
        displayFavoriteMeals();
    })
    .catch(error => console.log(error));
}

function fetchFavoriteMeals() {
    fetch('http://localhost:3000/favoriteMeals')
    .then(resp => resp.json())
    .then(favoriteMeals => {
        // console.log('fetchFavoriteMeals: ', favoriteMeals);
        arrFavoriteMeals.splice(0, arrFavoriteMeals.length, ...favoriteMeals);
        displayFavoriteMeals();
    })
    .catch(error => console.log(error));
}

function displayFavoriteMeals() {
    const ulMeals = document.getElementById('favorite-meals');
    ulMeals.innerHTML = '';
    arrFavoriteMeals.forEach((objMeal, i) => {
        const imgMeal = document.createElement('img');
        imgMeal.src = objMeal.strMealThumb;
        imgMeal.alt = objMeal.strMeal;
        imgMeal.width = '30';
        imgMeal.height = '30';
        imgMeal.classList.add('img-thumbnail');
        imgMeal.addEventListener('click',  e => displayMealDesc(objMeal.id, true));

        const spStrMeal = document.createElement('span');
        spStrMeal.textContent = objMeal.strMeal;
        spStrMeal.addEventListener('click', e => displayMealDesc(objMeal.id, true));

        const btnDelete = document.createElement('button');
        btnDelete.type = 'button'
        btnDelete.textContent = 'X';
        btnDelete.classList.add('btn-delete-favorite');
        btnDelete.addEventListener('click', e => {
            // If the meal description displays a meal deleted from favorite meals, update its heart in the meal description
            const liStrMeal = document.getElementById('display-meal-desc-strmeal');
            if (liStrMeal !== null && liStrMeal.textContent.slice(6) === objMeal.strMeal) {
                const spHeart = document.getElementById('heart');
                spHeart.textContent = EMPTY_HEART;
                spHeart.classList.remove('activated-heart');
            }
            deleteFavoriteMeal(objMeal.id);
        });

        const liMeal = document.createElement('li');
        liMeal.classList.add('pointer');
        liMeal.append(imgMeal, spStrMeal, btnDelete);
        ulMeals.appendChild(liMeal);
    });
}