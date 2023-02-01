# Fragments Microservice

## Getting Started

#### To deploy the server

`npm start`

#### To deploy in dev

`npm run dev`

#### To deploy in debugging mode

`npm run dev`

#### To run ESLint and check for errors

`npm run lint`

## Introduction

The Fragments Microservice is a cloud-based application that enables authenticated users to perform CRUD operations on cloud-stored data. Developed with continuous integration and unit testing, this microservice utilizes a range of AWS Cloud Services, including ECR, ECS, EC2, S3, Cognito, and DynamoDB, and is fully integrated with Docker.

## Overview

A fragment is defined as any piece of text (e.g., `text/plain`, `text/markdown`, `text/html`, etc.), JSON data (`application/json`), or an image in any of the following formats:

| Name       | Type         | Extension |
| ---------- | ------------ | --------- |
| PNG Image  | `image/png`  | `.png`    |
| JPEG Image | `image/jpeg` | `.jpg`    |
| WebP Image | `image/webp` | `.webp`   |
| GIF Image  | `image/gif`  | `.gif`    |


## API


### 1.1 Health Check

An unauthenticated `/` route is available for checking the health of the service. If the service is running, it returns an HTTP `200` status along with the following body:

```json
{
  "status": "ok",
  "author": "Jaan Javed",
  "githubUrl": "https://github.com/Jaan-J/fragments",
  "version": "version from package.json"
}
```


### 1.2 Fragments

The main data format of the API is the `fragment`.

#### 1.2.1 Fragment Overview

Fragments have two parts: 1) metadata (i.e., details _about_ the fragment); and 2) data (i.e., the actual binary contents of the fragment).

The fragment's **metadata** is an object that describes the fragment in the following format:

```json
{
  "id": "30a84843-0cd4-4975-95ba-b96112aea189",
  "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
  "created": "2021-11-02T15:09:50.403Z",
  "updated": "2021-11-02T15:09:50.403Z",
  "type": "text/plain",
  "size": 256
}
```

The fragment's **data** is a binary blob, and represents the actual contents of the fragment (e.g., a text or image file).

#### 1.2.2 Fragment Metadata Properties

The fragment `id` is a unique, URL-friendly, string identifier, for example `30a84843-0cd4-4975-95ba-b96112aea189`. 

The `ownerId` is the hashed email address of the user who owns this fragment. NOTE: for increased data privacy, the actual email address is not stored, only its [SHA256 hash](https://en.wikipedia.org/wiki/SHA-2).

Users can only create, update, or delete fragments for themselves (i.e,. they must be authenticated).

The `type` is a [Content Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type), which includes the fragment's [media type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) and possibly an optional character encoding (`charset`). The `type` describes the data (i.e., the data is text or a PNG). Valid examples of the `type` include:

1. `text/plain`
2. `text/plain; charset=utf-8`
3. `text/markdown`
4. `text/html`
5. `application/json`
6. `image/png`
7. `image/jpeg`
8. `image/webp`

The `size` is the number (integer) of bytes of data stored for this fragment, and is automatically calculated when a fragment is created or updated.


### 1.3 `POST /fragments`

Creates a new fragment for the current user (i.e., authenticated user). The client posts a file (raw binary data) in the `body` of the request and sets the `Content-Type` header to the desired `type` of the fragment. This is used to generate a new fragment metadata record for the data, and then both the data and metadata are stored.

If the `Content-Type` of the fragment being sent with the request is not supported, returns an HTTP `415` with an error message.

A successful response returns an HTTP `201`. It includes a `Location` header with a full URL to use in order to access the newly created fragment, for example: `Location: https://fragments-api.com/v1/fragments/30a84843-0cd4-4975-95ba-b96112aea189`.

The `body` of the response includes the complete fragment metadata for the newly created fragment:

```json
{
  "status": "ok",
  "fragment": {
    "id": "30a84843-0cd4-4975-95ba-b96112aea189",
    "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
    "created": "2021-11-02T15:09:50.403Z",
    "updated": "2021-11-02T15:09:50.403Z",
    "type": "text/plain",
    "size": 256
  }
}
```


### 1.4 `GET /fragments`

Gets all fragments belonging to the current user (i.e., authenticated user). NOTE: if a user has no fragments, an empty array `[]` is returned instead of an error.

The response includes a `fragments` array of `id`s:

```json
{
  "status": "ok",
  "fragments": ["b9e7a264-630f-436d-a785-27f30233faea", "dad25b07-8cd6-498b-9aaf-46d358ea97fe"]
}
```

#### 1.4.1 `GET /fragments/?expand=1`

Gets all fragments belonging to the current user (i.e., authenticated user), expanded to include a full representations of the fragments' metadata (i.e., not just `id`). For example, using `GET /fragments?expand=1` might return:

```json
{
  "status": "ok",
  "fragments": [
    {
      "id": "b9e7a264-630f-436d-a785-27f30233faea",
      "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
      "created": "2021-11-02T15:09:50.403Z",
      "updated": "2021-11-02T15:09:50.403Z",
      "type": "text/plain",
      "size": 256
    },
    {
      "id": "dad25b07-8cd6-498b-9aaf-46d358ea97fe",
      "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
      "created": "2021-11-02T15:09:50.403Z",
      "updated": "2021-11-02T15:09:50.403Z",
      "type": "text/plain",
      "size": 256
    }
  ]
}
```

### 1.5 `GET /fragments/:id`

Gets an authenticated user's fragment data (i.e., raw binary data) with the given `id`.

If the `id` does not represent a known fragment, returns an HTTP `404` with an error message.

If the `id` includes an optional extension (e.g., `.txt` or `.png`), the server attempts to convert the fragment to the `type` associated with that extension. Otherwise the successful response returns the raw fragment data using the `type` specified when created (e.g., `text/plain` or `image/png`) as its `Content-Type`.

For example, a Markdown fragment at `https://fragments-api.com/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698` could be automatically converted to HTML using `https://fragments-api.com/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.html` (note the `.html` extension) or to Plain Text using `https://fragments-api.com/v1/fragments/4dcc65b6-9d57-453a-bd3a-63c107a51698.txt` (note the `.txt` extension)

If the extension used represents an unknown or unsupported type, or if the fragment cannot be converted to this type, an HTTP `415` error is returned instead. For example, a plain text fragment cannot be returned as a PNG.

#### 1.5.1 Valid Fragment Conversions

This is the current list of valid conversions for each fragment type:

| Type               | Valid Conversion Extensions    |
| ------------------ | ------------------------------ |
| `text/plain`       | `.txt`                         |
| `text/markdown`    | `.md`, `.html`, `.txt`         |
| `text/html`        | `.html`, `.txt`                |
| `application/json` | `.json`, `.txt`                |
| `image/png`        | `.png`, `.jpg`, `.webp`, `.gif` |
| `image/jpeg`       | `.png`, `.jpg`, `.webp`, `.gif` |
| `image/webp`       | `.png`, `.jpg`, `.webp`, `.gif` |
| `image/gif`        | `.png`, `.jpg`, `.webp`, `.gif` |


### 1.6 `PUT /fragments/:id`

Allows the authenticated user to update (i.e., replace) the data for their existing fragment with the specified `id`.

If no such fragment exists with the given `id`, returns an HTTP `404` with an error message.

If the `Content-Type` of the request does not match the existing fragment's `type`, returns an HTTP `400` with an error message. A fragment's type can not be changed after it is created.

The entire request `body` is used to update the fragment's data, replacing the original value.

The successful response includes an HTTP `200` as well as updated fragment metadata:

```json
{
  "status": "ok",
  "fragment": {
    "id": "fdf71254-d217-4675-892c-a185a4f1c9b4",
    "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
    "created": "2021-11-02T15:09:50.403Z",
    "updated": "2021-11-02T15:09:50.403Z",
    "type": "text/plain",
    "size": 1024
  }
}
```

### 1.7 `GET /fragments/:id/info`

Allows the authenticated user to get (i.e., read) the metadata for one of their existing fragments with the specified `id`. If no such fragment exists, returns an HTTP `404` with an error message.

The fragment's metadata is returned:

```json
{
  "status": "ok",
  "fragment": {
    "id": "fdf71254-d217-4675-892c-a185a4f1c9b4",
    "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
    "created": "2021-11-02T15:09:50.403Z",
    "updated": "2021-11-02T15:09:50.403Z",
    "type": "text/plain",
    "size": 1024
  }
}
```

### 1.8 `DELETE /fragments/:id`

Allows the authenticated user to delete one of their existing fragments with the given `id`.

If the `id` is not found, returns an HTTP `404` with an error message.

Once the fragment is deleted, an HTTP `200` is returned, along with the `ok` status:

```json
{ "status": "ok" }
```
