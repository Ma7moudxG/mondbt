// netlify/functions/nextRouter.js
const { default: nextRouter } = require('@netlify/plugin-nextjs');

exports.handler = async (event, context) => {
  const request = event;
  request.headers['x-netlify-original-pathname'] = request.path;
  
  return nextRouter({
    request,
    response: {
      ...context,
    },
    basePath: '',
  });
};