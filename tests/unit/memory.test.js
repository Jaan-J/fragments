const {
    readFragmentData,
    writeFragmentData,
    readFragment,
    writeFragment,
  } = require('../../src/model/data/memory/index.js');
  
  // Write a test for readFragment
  test('readFragment', async () => {
    // Write a test for readFragment
    const fragment = await readFragment('ownerId', 'id');
    // Assert that the fragment is undefined
    expect(fragment).toBeUndefined();
  });
  
  test("writeFragment() expects string keys in fragment's metadata", () => {
    expect(async () => await writeFragment()).rejects.toThrow();
    expect(async () => await writeFragment({ ownerId: 1 })).rejects.toThrow();
    expect(async () => await writeFragment({ ownerId: 1, id: 1 })).rejects.toThrow();
  });
  
  // Write a test for readFragmentData
  test('readFragmentData', async () => {
    // Write a test for readFragmentData
    const fragmentData = await readFragmentData('ownerId', 'id');
    // Assert that the fragmentData is undefined
    expect(fragmentData).toBeUndefined();
  });
  
  // Write a test for writeFragmentData
  test('writeFragmentData', async () => {
    // Write a test for writeFragmentData
    const fragmentData = await writeFragmentData('ownerId', 'id', 'fragmentData');
    // Assert that the fragmentData is undefined
    expect(fragmentData).toBeUndefined();
  });