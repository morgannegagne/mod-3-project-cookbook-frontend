class RecipeIngredient{

  constructor({id, recipe_id, ingredient_id, ingredient_name, amount, measure}){
    this.ingredient_name = ingredient_name
    this.ingredient_id = ingredient_id
    this.id = id
    this.amount = amount
    this.measure = measure
  }

  render(){
    return `
      <li> ${this.amount} ${this.measure} ${this.ingredient_name} </li>
    `
  }

}
