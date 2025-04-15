import './App.css'
import ProductsList from './components/ProductsList'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-800">Fashion Store</h1>
        </div>
      </header>
      <main>
        <ProductsList />
      </main>
    </div>
  )
}

export default App
