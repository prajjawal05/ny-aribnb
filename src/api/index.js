export const getData = (filter, url = '/data') => {
    return new Promise((resolve, reject) => fetch(`http://localhost:5668/api${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
    })
        .then(response => response.json())
        .then(data => {
            resolve(data);
        })
        .catch(error => {
            reject(error);
        }));
}