class Recipe{

  constructor({id, name, created_at, url, directions}){
    this.name = name
    this.id = id
    this.directions = directions
    this.url = url
    this.created_at = created_at.split('T')[0]
    this.recipeIngredients = []
  }

  render(){
    return `
    <div id="recipe-${this.id}" data-id="${this.id}" data-name="${this.name}" class="column recipe-card" style="">
      <div class="flip-container" ontouchstart="this.classList.toggle('hover');">

        <div class="flipper">

          <div class="front">
            <div class="ui fluid card">
              <div class="image">
                <div class="crop">
                  <img src="${this.url}" class="center">
                </div>
              </div>
              <div class="content">
                <a class="header" style="font-family: 'Poller One', cursive;">${this.name}</a>
              </div>
            </div>
          </div>

          <div class="back">
            <div class="ui fluid card">
              <div class="content"><a class="header" style="font-family: 'Poller One', cursive;">${this.name}</a>
              <ul id="ingredient-list"> ${this.renderIngredients().join('')}</ul>
              <h4 dividing header">Directions</h4>
              <p>${this.directions}</p></div>
              <div class="extra content">
                <div class="ui two buttons">
                  <div data-id="${this.id}" class="ui basic green button edit-button">Edit</div>
                  <div data-id="${this.id}" class="ui basic red button delete-button">Delete</div>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
      </div>
    `
  }

  renderIngredients(){
    return this.recipeIngredients.map(ri => {return ri.render()})
  }


}
