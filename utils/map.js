export const transformPosition = (position, direction) => {
    let newPosition = [...position];
    for (let i = 0; i < direction; i += 1) {
        newPosition = [4 - newPosition[1], newPosition[0]];
    }

    return newPosition;
};
