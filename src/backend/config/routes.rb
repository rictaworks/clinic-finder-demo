Rails.application.routes.draw do
  namespace :api do
    resources :sessions, only: [:create]
    post 'search', to: 'search#search'
    resources :clinics, only: [:show]
    resources :reservations, only: [:create, :show, :destroy]
  end
  get '/health', to: proc { [200, {}, ['ok']] }
end
