;(function(exports) {

'use strict';

const zero = {re: 0, im: 0};
const one  = {re: 1, im: 0};
const ii = {re: 0, im: 1};

function squaredMagnitude(v) {
    return v.re*v.re + v.im*v.im;
}

function magnitude(v) {
    return Math.hypot(v.re, v.im);
}

function phase(v) {
    return Math.atan2(v.im, v.re);
}

function phase2(v) {
    let theta = Math.atan2(v.im, v.re);
    if (theta > 0) {
        return theta;
    }
    else {
        return Math.PI + (Math.PI + theta);
    }
}

function distance(u, v) {
    return magnitude(sub(u, v));
}

function eq(u, v) {
    return (   u.re === v.re
            && u.im === v.im);
}

const tolerance = 1e-4;    // XXX super arbitrary

function approxEqual(u, v) {
    return (   Math.abs(u.re - v.re) < tolerance
            && Math.abs(u.im - v.im) < tolerance);
}

function add(u, v) {
    return {re: u.re + v.re,
            im: u.im + v.im};
}

function sub(u, v) {
    return add(u, neg(v));
}

function mul(u, v) {
    return {re: u.re * v.re - u.im * v.im,
            im: u.im * v.re + u.re * v.im};
}

function power(u, exponent) {
    let result = one;
    if (exponent >= 0) {
        for (let count = 0; count < exponent; count++)
            result = mul(u, result);
    }
    else {
        for (let count = 0; count < -exponent; count++)
            result = div(result, u); 
    }
    return result;
}

function div(u, v) {
    return mul(u, reciprocal(v));
}

function reciprocal(v) {
    const vv = v.re*v.re + v.im*v.im;
    return rmul(1/vv, conjugate(v));
}

function negPower(u, exponent) {
    let result = one;
    for (let count = 0; count < exponent; count++)
        result = div(result, u);
    return result;
}

function conjugate(v) {
    return {re:  v.re,
            im: -v.im};
}

function neg(v) {
    return {re: -v.re,
            im: -v.im};
}

function rmul(r, v) {
    return {re: r * v.re,
            im: r * v.im};
}

// An approximate square root of square.
// Not necessarily the principal one. (How to get that?)
function roughSqrt(square) {
    let z = rmul(.5, add(one, square)); // (is this a silly first guess?)
    for (let i = 10; 0 <= i; --i) {
        z = rmul(.5, add(z, div(square, z)));
    }
    return z;
}

// An approximate cube root of cube.
// Not necessarily the principal one. (How to get that?)
function roughCubeRoot(cube) {
    let z = roughSqrt(cube);
    for (let i = 10; 0 <= i; --i) {
        z = rmul(1/3, add(rmul(2, z),
                          div(cube, mul(z, z))));
    }
    return z;
}

function show(z) {
    return `(${z.re}+${z.im}i)`;
}

if (exports.mathtoys === void 0) exports.mathtoys = {};
exports.mathtoys.complex = {
    zero,
    one,
    ii,
    magnitude,
    phase,
    phase2,
    distance,
    eq,
    approxEqual,
    add,
    sub,
    mul,
    power,
    div,
    reciprocal,
    negPower,
    neg,
    conjugate,
    rmul,
    roughSqrt,
    show,
};
})(this);
