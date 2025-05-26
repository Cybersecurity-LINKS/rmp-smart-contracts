// Copyright 2025 Fondazione LINKS

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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
