class App {
  constructor(){
    this.recipes = []
    this.ingredients = []
    this.includedSearchIngredients = []
    this.recipesContainer = document.getElementById('recipes')
    this.addRecipeButton = document.getElementById('add-new-recipe')
    this.newRecipeForm = document.getElementById('new-recipe-form')
    this.ingredientsCheckbox = document.getElementById('ingredients-checkbox')
    this.submitRecipeButton = document.getElementById('submit-new-recipe')
    this.recipeNameField = document.getElementById('recipe-name')
    this.recipeDirectionsField = document.getElementById('recipe-directions')
    this.recipeUrlField = document.getElementById('recipe-url')
    this.addNewIngredient = document.getElementById('add-new-ingredient')
    this.newIngredientName = document.getElementById('new-ingredient-name')
    this.editRecipeButton = document.getElementById('edit-recipe-button')
    this.imageEditForm = document.getElementById('recipe_image_edit')
    this.sortDateButton = document.getElementById('sort-date')
    this.sortNameButton = document.getElementById('sort-a-z')
    this.recipeSearchBar = document.getElementById('search-recipes')
    this.addIcon = document.getElementById('add-icon')
    this.includeIngredientField = document.getElementById("include-ingredient-field")
    this.includedIngredientsList = document.getElementById('included-ingredients')
    this.addEventListeners()
    this.fetchIngredients()
  }

  addEventListeners(){
    this.addRecipeButton.addEventListener('click', event=>{
      this.submitRecipeButton.style.display = ""
      this.editRecipeButton.style.display = "none"
      $('.ui.modal').modal('show');
      this.imageEditForm.src = "https://semantic-ui.com/images/wireframe/image.png"
      this.recipeNameField.value = ""
      this.recipeUrlField.value = ""
      this.recipeDirectionsField.value = ""
      this.fetchIngredients()
      // if (this.newRecipeForm.style.display === "none"){
      //   this.ingredients = []
      //   this.newRecipeForm.style.display = "block"
      //   this.submitRecipeButton.style.display = ""
      //   this.editRecipeButton.style.display = "none"
      //   this.fetchIngredients()
      //
      // } else {
      //   this.recipeNameField.value = ""
      //   this.newRecipeForm.style.display = "none"
      // }
    })
    this.submitRecipeButton.addEventListener('click', event=>{
      this.saveRecipe(event)
    })
    this.editRecipeButton.addEventListener('click', event=>{
      this.patchRecipe(event)
    })
    this.addNewIngredient.addEventListener('click', event=>{
      this.createNewIngredient(event)
    })
    this.sortNameButton.addEventListener('click', event=>{
      event.target.style["font-weight"] = "bold"
      this.sortDateButton.style["font-weight"] = "normal"
      this.sortRecipesAlphabetically()
      this.render()
    })
    this.sortDateButton.addEventListener('click', event=>{
      event.target.style["font-weight"] = "bold"
      this.sortNameButton.style["font-weight"] = "normal"
      this.sortRecipesByDate()
      this.render()
    })
    this.recipeSearchBar.addEventListener('keyup', event => {
      this.filterRecipesBySearchTerm()
    })
    this.addIcon.addEventListener('click', event => {
      this.addIngredientToIncludedList(event)
      this.filterRecipesBySearchTerm()
    })
    this.includeIngredientField.addEventListener('keyup', event => {
      if (event.keyCode === 13){
        this.addIngredientToIncludedList(event)
        this.filterRecipesBySearchTerm()
      }
    });
  }

  createRecipeObject(){
    let name = this.recipeNameField.value
    let url = this.recipeUrlField.value
    let directions = this.recipeDirectionsField.value
    let inputs = this.ingredientsCheckbox.children
    let checkedValues=[]
    for (let i = 0; i < inputs.length; i++){
      let checkboxDiv = inputs[i].firstElementChild
      let checkbox = checkboxDiv.firstElementChild
      if (checkbox.checked){
        let ingredientObj = {}
        let id = checkbox.dataset.id
        let amountInput = document.getElementById(`amount-${id}`)
        let measureInput = document.getElementById(`measure-${id}`)
        ingredientObj.id = id
        ingredientObj.amount = amountInput.value
        ingredientObj.measure = measureInput.value
        checkedValues.push(ingredientObj)
      }
    }
    this.recipeNameField.value = ""
    this.recipeUrlField.value = ""
    this.recipeDirectionsField.value = ""
    return { "recipe": {name: name, ingredients: checkedValues, url: url, directions: directions} }
  }

  saveRecipe(event){
    let newRecipeObj = this.createRecipeObject()
    fetch('http://localhost:3000/recipes', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accepts: "applicatin/json"
      },
      body: JSON.stringify(newRecipeObj)
    })
      .then(res => res.json())
      .then(json => {
        this.recipes = []
        this.ingredients =[]
        // this.newRecipeForm.style.display = "none"
        this.recipeNameField.value = ""
        this.fetchRecipes()
      })
  }

  fetchRecipes(){
    this.recipes = [];
    fetch('http://localhost:3000/recipes')
      .then(res => res.json())
      .then(json => this.createRecipes(json))
  }

  sortRecipesAlphabetically(){
    this.recipes = this.recipes.sort((a, b) => {
      let recipeA = a.name.toUpperCase()
      let recipeB = b.name.toUpperCase()
      if (recipeA < recipeB){
        return -1;
      } else if (recipeA > recipeB){
        return 1;
      } else {
        return 0;
      }
    })
  }
  sortRecipesByDate(){
    this.recipes = this.recipes.sort((a, b) => {
      let recipeA = a.created_at
      let recipeB = b.created_at
      if (recipeA < recipeB){
        return 1;
      } else if (recipeA > recipeB){
        return -1;
      } else {
        return 0;
      }
    })
  }

  addIngredientToIncludedList(event){
    let input = this.includeIngredientField.value
    let html = `
      <div class="ui button" data-input="${input}">
        <i class="trash icon"></i> ${input}
      <div>
    `
    this.includedIngredientsList.innerHTML += html
    this.includedSearchIngredients.push(input)
    this.includeIngredientField.value = ''
    let trashIcons = document.querySelectorAll(".trash.icon")
    trashIcons.forEach(icon => icon.addEventListener('click', event => {
        let input = event.target.parentNode.dataset.input
        let index = this.includedSearchIngredients.findIndex( x => x === input)
        this.includedSearchIngredients.splice(index, 1);
        this.filterRecipesBySearchTerm()
        event.target.parentNode.remove()
      })
    )
  }

  getVisibleRecipes(){
    let recipeCards = document.querySelectorAll('.recipe-card')
    let visibleRecipes = []
    recipeCards.forEach(recipeCard => {
      let recipeId = recipeCard.dataset.id
      if (recipeCard.style.display === ''){
        let recipe = this.recipes.find(recipe => recipe.id == recipeId)
        visibleRecipes.push(recipe)
      }
    })
    return visibleRecipes

  }
  filterRecipesByIngredients(){
    let visibleRecipes = this.getVisibleRecipes()
    this.includedSearchIngredients.forEach(ingredient => {
      visibleRecipes.forEach(recipe => {
        let recipeId = recipe.id
        let included = false
        recipe.recipeIngredients.forEach(ri => {
          if (ri.ingredient_name.toLowerCase().indexOf(ingredient.toLowerCase()) > -1){
            included = true
          }
        })
        if (!included){
          document.getElementById(`recipe-${recipeId}`).style.display = "none"
        }
      })
    })
  }

  filterRecipesBySearchTerm(){
    let searchTerm = this.recipeSearchBar.value.toLowerCase()

    document.querySelectorAll(".recipe-card").forEach(recipeCard => {
        let recipeCardNames = recipeCard.dataset.name.toLowerCase().split(" ")
        console.log(recipeCardNames)
        let visible = false;
        recipeCardNames.forEach(recipeCardName => {
          if ((recipeCardName.startsWith(searchTerm)) || searchTerm === ""){
            visible = true;
          }
        })

        if (visible) {
          recipeCard.style.display = ""
        } else {
          recipeCard.style.display = "none"
        }

      })
      this.filterRecipesByIngredients()
  }

  createRecipes(recipesJSON){
    recipesJSON.forEach(recipeJSON => {
      let recipe = new Recipe(recipeJSON)
      let ingredients = recipeJSON.recipe_ingredients
      ingredients.forEach(ingredientJSON => {
        let ingredient = new RecipeIngredient(ingredientJSON)
        recipe.recipeIngredients.push(ingredient)
      })
      this.recipes.push(recipe)
    })
    this.sortRecipesAlphabetically()
    this.render()
  }

  showEditRecipeForm(event){
    let id = event.target.dataset.id
    this.editRecipeButton.dataset.id = id
    // if (this.newRecipeForm.style.display === "none"){
    $('.ui.modal').modal('show');
      this.submitRecipeButton.style.display = "none"
      this.editRecipeButton.style.display = ""
      // this.newRecipeForm.style.display = "block"

      this.renderIngredients()
      let recipe = this.recipes.find(recipe => {return recipe.id == id})
      this.recipeNameField.value = recipe.name
      this.recipeDirectionsField.value = recipe.directions
      this.recipeUrlField.value = recipe.url
      let recipeIngredients = recipe.recipeIngredients
      let checkboxes = document.querySelectorAll('.ingredient-checkbox')
      // let imageEditForm = document.getElementById('recipe_image_edit')
      this.imageEditForm.src = recipe.url
      checkboxes.forEach(checkbox => {
        recipeIngredients.forEach(ri => {
          if (ri.ingredient_id == checkbox.dataset.id){
            checkbox.checked = true
            let div = document.getElementById(`amounts-measures-${ri.ingredient_id}`)
            checkbox.checked ? div.style.display = "block" : div.style.display = "none"
            document.getElementById(`amount-${ri.ingredient_id}`).value = ri.amount
            document.getElementById(`measure-${ri.ingredient_id}`).value = ri.measure
          }
        })
      })
    // } else {
    //   this.newRecipeForm.style.display = "none"
    // }
  }

  patchRecipe(event){
    let recipeObj = this.createRecipeObject()
    let id = event.target.dataset.id
    fetch(`http://localhost:3000/recipes/${id}`,{
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        Accepts: "application/json"
      },
      body: JSON.stringify(recipeObj)
    })
      .then(res => res.json())
      .then(json => {
        // this.newRecipeForm.style.display = "none"
        this.fetchRecipes()
      })
  }

  //Create a recipe card from array of Objs
  renderRecipes(){
    return this.recipes.map(recipe => {return recipe.render()})
  }

  fetchIngredients(){
    fetch('http://localhost:3000/ingredients')
      .then(res => res.json())
      .then(json => this.createIngredients(json))
  }

  createIngredients(ingredientsJSON){
    this.ingredients = []
    ingredientsJSON.forEach(ingredientJSON => {
      let ingredient = new Ingredient(ingredientJSON)
      this.ingredients.push(ingredient)
    })
    this.sortIngredientsAlphabetically()
    this.renderIngredients()
  }

  sortIngredientsAlphabetically(){
    this.ingredients = this.ingredients.sort((a, b) => {
      let ingredientA = a.name.toUpperCase();
      let ingredientB = b.name.toUpperCase();

      if (ingredientA < ingredientB) {
        return -1;
      } else if (ingredientA > ingredientB) {
        return 1;
      } else {
        return 0
      }
    });
  }

  createNewIngredient(event){
    let name = this.newIngredientName.value
    let ingredientObj = {ingredient: {name: name}}
    this.newIngredientName.value = ""
    fetch('http://localhost:3000/ingredients', {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accepts: "application/json"
      },
      body: JSON.stringify(ingredientObj)
    })
      .then(res => res.json())
      .then(json => {
        // this.fetchIngredients()
        let addedIngredient = new Ingredient(json)
        this.ingredients.push(addedIngredient)
        let ingredientHTML = addedIngredient.render()
        let wrapper = document.createElement('div')
        wrapper.innerHTML = ingredientHTML
        let addCheckbox = wrapper.firstChild
        let checkboxInput = addCheckbox.nextSibling.querySelector(".ingredient-checkbox")
        this.ingredientsCheckbox.appendChild(addCheckbox.nextSibling)
        checkboxInput.addEventListener('click', event => {
          let id = event.target.dataset.id
          let div = document.getElementById(`amounts-measures-${id}`)
          event.target.checked ? div.style.display = "block" : div.style.display = "none"
        })
      })
  }

  renderIngredients(){
    let ingredientHTML = this.ingredients.map(ingredient => {return ingredient.render()}).join('')
    this.ingredientsCheckbox.innerHTML = ingredientHTML
    let checkboxes = document.querySelectorAll('.ingredient-checkbox')
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('click', event => {
        let id = event.target.dataset.id
        let div = document.getElementById(`amounts-measures-${id}`)
        event.target.checked ? div.style.display = "block" : div.style.display = "none"
      })
    })
  }

  render(){
    this.recipesContainer.innerHTML = this.renderRecipes().join('')
    let allDeleteButtons = document.querySelectorAll(".delete-button")
    let allEditButtons = document.querySelectorAll(".edit-button")

    allDeleteButtons.forEach(deleteButton => {
      deleteButton.addEventListener("click", event => {
        fetch(`http://localhost:3000/recipes/${event.target.dataset.id}`,{
          method: "DELETE"
        })
        .then(res => res.json())
        .then(json => this.fetchRecipes())
      })
    })
    allEditButtons.forEach(editButton => {
      editButton.addEventListener("click", event => {
        this.showEditRecipeForm(event)
        })
    })
  }

}
