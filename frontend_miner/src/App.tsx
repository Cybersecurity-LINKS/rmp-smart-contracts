import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {HeroUIProvider} from "@heroui/react";
import HomePage from './pages/Home';


const router = (
    <Routes>
        <Route path="/" element={<HomePage/>}/>
    </Routes>
);

function App() {
    return (
        <HeroUIProvider locale="gb-GB">
            <Router
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true
                }}
            >
                {router}
            </Router>
        </HeroUIProvider>
    );
}

export default App;
