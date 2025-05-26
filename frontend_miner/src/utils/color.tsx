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

export const getAlgColor = (href: string) => {
    const filename = href.split('/').pop() || '';

    if (filename.toLowerCase().includes('pqc')) {
        return "#10B981"; // green-500
    }
    if (filename.toLowerCase().includes('hybrid')) {
        return "#8B5CF6"; // purple-500
    }
    if (filename.toLowerCase().includes('zk')) {
        return "#EF4444"; // red-500
    }
    return "#3B82F6"; // blue-500
};
  