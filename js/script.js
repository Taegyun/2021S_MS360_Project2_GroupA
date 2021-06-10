(function() {
    // JS to accompany the HTML to compute the Mohrs Circle 2D.
    // Written by Amarnath S, aka Avijnata, May 2019
    // amarnaths.codeproject@gmail.com
    // Modified by Taegyun Ahn and Jaehee Lee, June 2021
    // for group project of MS360 2021 Spring, KAIST.
    // contact: xorbs0088@kaist.ac.kr (Taegyun Ahn)
    
    var sigmax;
    var sigmay;
    var tauxy;
    var sigma1;
    var sigma2;
    var tauMax;
    var canvas01;
    var context01;
    var canvas02;
    var context02;
    var canvas03;
    var context03;
    var canvas04;
    var context04;
    var angle;
    var sigmax1;
    var sigmay1;
    var taux1y1;
    var sigmax1P;
    var sigmay1P;
    var taux1y1P;
    var angleDegrees;
    var angleDegreesP;
    var maxPrincipalAngle; // in degrees
    var maxShearAngle; // in degrees

    window.onload = init;

    function init() {
        bnCompute.addEventListener('click', bnComputeClick, false);
        raAngle.addEventListener('input', angleChange, false);

        canvas01 = document.getElementById('canvasMohr');
        context01 = canvas01.getContext('2d');

        canvas02 = document.getElementById('canvasTransform');
        context02 = canvas02.getContext('2d');

        canvas03 = document.getElementById('canvasTransformMaxPrincipal');
        context03 = canvas03.getContext('2d');

        canvas04 = document.getElementById('canvasTransformMaxShear');
        context04 = canvas04.getContext('2d');

        bnComputeClick();
    }

    //Compute the Principal Stresses and the corresponding angles.
    function bnComputeClick()
    {
        var sigmaxStr = document.getElementById('sigmax').value;
        var sigmayStr = document.getElementById('sigmay').value;
        var tauxyStr = document.getElementById('tauxy').value;

        document.getElementById('raAngle').innerHTML = 0.0;

        if ( isNaN(sigmaxStr) || isNaN(sigmayStr) || isNaN(tauxyStr) ) {
            var errorMsg = 'Please enter only numeric values for stresses';
            document.getElementById('opError').textContent = errorMsg;
            document.getElementById('opSigma1').textContent = '';
            document.getElementById('opSigma2').textContent = '';
            document.getElementById('opTauMax').textContent = '';
            document.getElementById('opThetaSigma1').textContent = '';
            document.getElementById('opThetaSigma2').textContent = '';

            document.getElementById('sigmax').value = 15;
            document.getElementById('sigmay').value = 5;
            document.getElementById('tauxy').value = 4;
        } else {
            sigmax = parseFloat(sigmaxStr);
            sigmay = parseFloat(sigmayStr);
            tauxy = parseFloat(tauxyStr);

            var res1 = (sigmax - sigmay) / 2.0;
            var res2 = res1 * res1;
            var res3 = Math.sqrt(res2 + tauxy * tauxy);

            var res4 = (sigmax + sigmay) / 2.0;
            sigma1 = res4 + res3;
            sigma2 = res4 - res3;
            tauMax = res3;

            var sigma1Disp = sigma1.toFixed(4) + ' MPa';
            var sigma2Disp = sigma2.toFixed(4) + ' MPa';
            var tauMaxDisp = tauMax.toFixed(4) + ' MPa';
            var cosTwoTheta = res1/res3;
            var sinTwoTheta = tauxy/res3;
            var twoThetaSigma1 = Math.atan2(sinTwoTheta, cosTwoTheta);
            var thetaSigma1 = twoThetaSigma1 * 0.5 * 180.0 / Math.PI; // in degrees
            var thetaSigma2 = thetaSigma1 + 90; // degrees;
            maxPrincipalAngle = thetaSigma1; // in degrees
            maxShearAngle = maxPrincipalAngle - 45.0; // in degrees

            var thetaSigma1Disp, thetaSigma2Disp;
            if( Math.abs(res3) > 0.00001) {
                thetaSigma1Disp = thetaSigma1.toFixed(2) + ' °';thetaSigma2Disp = thetaSigma2.toFixed(2) + ' °';
            } else {
                // Case when the two principal stresses are identical, and shear stress is zero.
                thetaSigma1Disp = '-';
                thetaSigma2Disp = '-';
            }

            document.getElementById('opSigma1').textContent = sigma1Disp;
            document.getElementById('opSigma2').textContent = sigma2Disp;
            document.getElementById('opTauMax').textContent = tauMaxDisp;
            document.getElementById('opThetaSigma1').textContent = thetaSigma1Disp;
            document.getElementById('opThetaSigma2').textContent = thetaSigma2Disp;
            document.getElementById('opError').textContent = '';

            sigmax1 = sigmax;
            sigmay1 = sigmay;
            taux1y1 = tauxy;
            angleDegrees = 0;
            angleDegreesP = maxPrincipalAngle.toFixed(2);
            document.getElementById('raAngle').value = angleDegrees;
            document.getElementById('opAngle').value = angleDegrees ;

            drawMohrsCircle();
            drawRotatingSquare();
            computeSecondaryStresses(0.0);
            computeSecondaryStressesMaxPrincipal(maxPrincipalAngle);
            drawRotatingSquareMaxPrincipal();
            computeSecondaryStressesMaxShear(maxShearAngle);
            drawRotatingSquareMaxShear();
        }
    }

    // Draw the Mohr's Circle. This Mohr's circle does not change position irrespective of
    // the stress values. The only things which change are the stress values themselves,
    // in essence the scale of the figure.
    function drawMohrsCircle() {
        var yMargin = 10;
        var rightMargin = 90;

        var cWidth = canvas01.width;
        var cHeight = canvas01.height;
        var diameter = cHeight - 10 * yMargin;
        var rightPoint = cWidth - rightMargin;
        var leftPoint = rightPoint - diameter;

        var centreX = ( leftPoint + rightPoint ) / 2;
        var centreY = cHeight / 2;
        var radius = diameter / 2;

        context01.fillStyle = 'white'; // 모어원밖의 네모
        context01.fillRect(0, 0, cWidth, cHeight);

        context01.save();

        context01.beginPath();
        context01.arc(centreX, centreY, radius, 0, 2 * Math.PI, false);
        context01.fillStyle = 'white'; //모어원 그리기
        context01.fill();
        context01.lineWidth = 2;
        context01.strokeStyle = 'black'; // 원래 #003300 였는데 black으로 바꿈
        context01.arc(centreX, centreY, 2, 0, 2 * Math.PI, false);

        // Points sigmax, tauxy, and sigmay, -tauxy
        var distance1;
        var distance2;
        var EPSILON = 0.0001;
        if( Math.abs(sigma1 - sigma2) > EPSILON) {
            distance1 = (sigmax - sigmay) * diameter / (sigma1 - sigma2);
            distance2 = tauxy * diameter / (sigma1 - sigma2);
        } else {
            distance1 = diameter;
            distance2 = 0;
        }

        var point1x = centreX + distance1 / 2;
        var point1y = centreY + distance2;

        var point2x = centreX - distance1 / 2;
        var point2y = centreY - distance2;

        context01.moveTo(point1x, point1y);
        context01.lineTo(point2x, point2y);

        context01.font = "10pt sans-serif";
        context01.fillStyle = "BLUE";
        context01.textAlign = "left";
        var text1 = '(' + sigmax.toFixed(2) + ', ' + tauxy.toFixed(2) + ')';
        context01.fillText(text1, point1x + 5, +point1y + 5);

        context01.textAlign = 'right';
        var minusTauxy = -tauxy;
        var minusText = minusTauxy.toFixed(2);
        text1 = '(' + sigmay.toFixed(2) + ', ' + minusText + ')';
        context01.fillText(text1, point2x - 5, point2y + 5);

        context01.moveTo(point1x, point1y);
        context01.lineTo(point1x, centreY);

        context01.moveTo(point2x, point2y);
        context01.lineTo(point2x, centreY);
        context01.stroke();

        // Draw the moving circle
        var distance3;
        var distance4;
        if( Math.abs(sigma1 - sigma2) > EPSILON) {
            distance3 = (sigmax1 - sigmay1) * diameter / (sigma1 - sigma2);
            distance4 = taux1y1 * diameter / (sigma1 - sigma2);
        } else {
            distance3 = diameter;
            distance4 = 0;
        }
        var point3x = centreX + distance3 / 2;
        var point3y = centreY + distance4;
        var dynamicText = '\u03C3 = ' + sigmax1.toFixed(2) + ', \u03C4 = ' +
             taux1y1.toFixed(2);
        var thetaText = 'Rotated angle = 2\u03B8'


        // X-axis
        context01.moveTo(10, cHeight / 2);
        context01.lineTo(cWidth - 10, cHeight / 2);

        // Y-axis
        context01.moveTo(10, cHeight - 10);
        context01.lineTo(10, cHeight - 150);
        context01.beginPath();

        context01.fillStyle = 'Red';
        context01.arc(point3x, point3y, 5, 0, 2 * Math.PI, true);
        context01.fill();

        // x grid
        var stepXgrid;
        for (stepXgrid = 1; stepXgrid < 9; stepXgrid++){
          context01.beginPath();
          context01.lineWidth = 0.5;
          context01.strokeStyle = 'gray';
          context01.moveTo(0, 50*stepXgrid);
          context01.lineTo(cWidth, 50*stepXgrid);
          context01.stroke();
        }

        // y grid
        var stepYgrid;
        for (stepYgrid = 1; stepYgrid < 14; stepYgrid++){
          context01.beginPath();
          context01.lineWidth = 0.5;
          context01.strokeStyle = 'gray';
          context01.moveTo(50*stepYgrid, 0);
          context01.lineTo(50*stepYgrid, cHeight);
          context01.stroke();
        }

        // X-axis
        context01.beginPath();
        context01.moveTo(10, cHeight / 2);
        context01.lineTo(cWidth - 10, cHeight / 2);
        context01.lineWidth = 2;
        context01.strokeStyle = 'black'
        context01.stroke();
        // Y-axis
        context01.moveTo(10, cHeight - 10);
        context01.lineTo(10, cHeight - 150)

        // Draw the dynamic text at right hand corner
        context01.font = "10pt dialog";
        context01.fillStyle = 'black';
        context01.textAlign = "right";
        context01.fillText(dynamicText, canvas01.width - 10, 20);
        context01.fillText(thetaText, canvas01.width - 10, 45);
        context01.stroke();

        drawArrow(context01, cWidth-20, cHeight/2, cWidth-10, cHeight / 2);
        drawArrow(context01, 10, cHeight/2, 10, cHeight - 10);

        context01.beginPath();
        context01.lineWidth = 2;
        context01.strokeStyle = 'Red';
        context01.moveTo(centreX, centreY);
        context01.lineTo(point3x, point3y);
        context01.stroke();

        context01.beginPath();
        var radiusOfArc = diameter / 8;
        var xVal = point1x - centreX;
        var yVal = point1y - centreY;
        var startAngle = Math.atan2(yVal, xVal);
        xVal = point3x - centreX;
        yVal = point3y - centreY;
        var endAngle = Math.atan2(yVal, xVal);
        context01.arc(centreX, centreY, radiusOfArc, startAngle, endAngle, true);
        context01.stroke();

        // maximum shear stress condition
        context01.save();
        context01.beginPath();
        context01.setLineDash([5,3]);
        var maxShearFromX = centreX;
        var maxShearFromY = centreY + diameter/2;
        var maxShearToY = centreY - diameter/2;
        context01.lineWidth = 2;
        context01.strokeStyle = 'green';
        context01.moveTo(maxShearFromX, maxShearFromY);
        context01.lineTo(maxShearFromX, maxShearToY);
        context01.stroke();
        context01.restore();

        context01.beginPath();
        context01.strokeStyle = 'green'
        context01.fillStyle = 'green'
        context01.arc(maxShearFromX, maxShearToY, 3, 0, 2*Math.PI, true);
        context01.fill();
        context01.stroke();

        context01.beginPath();
        context01.strokeStyle = 'green'
        context01.fillStyle = 'green'
        context01.arc(maxShearFromX, maxShearFromY, 3, 0, 2*Math.PI, true);
        context01.fill();
        context01.stroke();

        context01.font = "10pt dialog";
        context01.fillStyle = 'green';
        context01.textAlign = "right";
        context01.fillText('Max shear stress = '+(-tauMax.toFixed(2)), maxShearFromX, maxShearToY - 10);
        context01.fillText('Max shear stress = '+(tauMax.toFixed(2)), maxShearFromX, 470 - maxShearToY);

        // maximum principal stress condition
        context01.save();
        context01.beginPath();
        context01.setLineDash([5,3]);
        var maxPrincipalFromX = centreX - diameter/2;
        var maxPrincipalFromY = centreY;
        var maxPrincipalToX = centreX + diameter/2;
        context01.lineWidth = 2;
        context01.strokeStyle = 'rgb(255,90,0)';
        context01.moveTo(maxPrincipalFromX, maxPrincipalFromY);
        context01.lineTo(maxPrincipalToX, maxPrincipalFromY);
        context01.stroke();
        context01.restore();

        context01.beginPath();
        context01.strokeStyle = 'rgb(255,90,0)'
        context01.fillStyle = 'rgb(255,90,0)'
        context01.arc(maxPrincipalToX, maxPrincipalFromY, 3, 0, 2*Math.PI, true);
        context01.fill();
        context01.stroke();

        context01.beginPath();
        context01.strokeStyle = 'rgb(255,90,0)'
        context01.fillStyle = 'rgb(255,90,0)'
        context01.arc(maxPrincipalFromX, maxPrincipalFromY, 3, 0, 2*Math.PI, true);
        context01.fill();
        context01.stroke();

        context01.font = "10pt dialog";
        context01.fillStyle = 'rgb(255,90,0)';
        context01.fillText('Principal', maxPrincipalFromX-5, maxPrincipalFromY-5);
        context01.textAlign = 'left';
        context01.fillText('Principal', maxPrincipalToX+5, maxPrincipalFromY-5);
        context01.textAlign = 'right';

        context01.beginPath();
        context01.fillStyle = 'Red';
        context01.arc(point3x, point3y, 5, 0, 2 * Math.PI, true);
        context01.fill();

        context01.font = "15pt sans-serif";
        context01.fillStyle = 'black';
        context01.fillText("Mohr's Circle", 125, 20);

        drawStaticLabels(context01);
        drawCentreOfCircle(context01, leftPoint, rightPoint);
        drawSigma1And2(context01, leftPoint, rightPoint, sigma1, sigma2);

        context01.restore();
    }

    // Draw the static labels on the top canvas - these are the x and y axes
    function drawStaticLabels(context) {
        context.save();
        var xTextMargin1 = canvas01.width - 12;
        context.beginPath();
        context.font = "15pt sans-serif";
        context.fillStyle = "black";
        context.textAlign = "right";
        context.fillText("\u03C3", xTextMargin1, canvas01.height / 2 - 10); // sigma
        context.font = "10pt sans-serif";
        context.fillText("\u03C4 couterclockwise", 130, canvas01.height - 20); // tau
        context.font = "10pt sans-serif";
        context.fillText("\u03C4 clockwise", 90, canvas01.height - 260); // tau
        context.stroke();
        context.restore();
    }

    // From SO site, to draw an arrow head
    function drawArrow(context, fromx, fromy, tox, toy){
        context.save();
        context.beginPath();
        var headlen = 10;   // length of head in pixels
        var angle = Math.atan2(toy-fromy,tox-fromx);
        context.moveTo(fromx, fromy);
        context.lineTo(tox, toy);
        context.lineTo(tox-headlen*Math.cos(angle-Math.PI/6),toy-headlen*Math.sin(angle-Math.PI/6));
        context.moveTo(tox, toy);
        context.lineTo(tox-headlen*Math.cos(angle+Math.PI/6),toy-headlen*Math.sin(angle+Math.PI/6));
        context.stroke();
        context.restore();
    }

    // Draw the stress value corresponding to the centre of the circle on the top canvas
    function drawCentreOfCircle(context, leftPointX, rightPointX) {
        var centreX = (leftPointX + rightPointX) / 2;
        context.save();
        context.beginPath();
        context.moveTo(centreX, canvas01.height / 2 - 7);
        context.lineTo(centreX, canvas01.height / 2 + 7);

        context.font = "10pt sans-serif";
        context.fillStyle = "BLUE";
        context.textAlign = "left";
        var sigmaCentre = ( sigmax + sigmay ) / 2;
        var sigmaCentreDisp = sigmaCentre.toFixed(2);
        var centreText = '(' + sigmaCentreDisp + ', 0' + ')';
        context.fillText(centreText, centreX + 5, canvas01.height / 2 - 5);

        context.stroke();
        context.restore();
    }

    // Draw the Principal Stresses on the Mohr's circle in the top canvas
    function drawSigma1And2(context,leftPointX, rightPointX, sigma1, sigma2){
        context.save();

        context.beginPath();
        context.font = "10pt sans-serif";
        context.fillStyle = "rgb(255,90,0)";
        context.textAlign = "left";

        var text1 = '(' + sigma1.toFixed(2) + ', 0' + ')';
        context.fillText(text1, rightPointX + 3, canvas01.height / 2 + 15);

        context.textAlign = "right";
        var text2 = '(' + sigma2.toFixed(2) + ', 0' + ')';
        context.fillText(text2, leftPointX - 5, canvas01.height / 2 + 15);
        context.stroke();

        context.restore();
    }

    // Draw the rotating square indicating the rotated square element
    function drawRotatingSquare()
    {
        var angleValue = document.getElementById('raAngle').value;
        angle = parseFloat(angleValue);
        angle = angle * Math.PI / 180.0;

        context02.save();

        var radius = 180;
        var radiusShear = 182;
        var x1, y1, x2, y2, x3, y4, x4, y4;
        var centreX = 200;
        var centreY = canvas02.height / 2;
        x1 = centreX + radius * Math.cos(angle + Math.PI * 0.25);
        y1 = centreY - radius * Math.sin(angle + Math.PI * 0.25);
        x2 = centreX + radius * Math.cos(angle + Math.PI * 0.75);
        y2 = centreY - radius * Math.sin(angle + Math.PI * 0.75);
        x3 = centreX + radius * Math.cos(angle + Math.PI * 1.25);
        y3 = centreY - radius * Math.sin(angle + Math.PI * 1.25);
        x4 = centreX + radius * Math.cos(angle + Math.PI * 1.75);
        y4 = centreY - radius * Math.sin(angle + Math.PI * 1.75);

        context02.beginPath();
        context02.fillStyle = 'white'; // 네모밖의 네모
        context02.fillRect(0, 0, canvas02.width, canvas02.height);
        context02.lineWidth = 2;
        context02.moveTo(x1+80, y1); // Point 1
        context02.lineTo(x2+80, y2); // Point 2
        context02.lineTo(x3+80, y3); // Point 3
        context02.lineTo(x4+80, y4); // Point 4
        context02.lineTo(x1+80, y1); // Point 1
        context02.stroke();

        // For the normal stress components
        var x5 = (x1 + x4) / 2;
        var y5 = (y1 + y4) / 2;

        var x6 = (3 * x5 - centreX) / 2;
        var y6 = (3 * y5 - centreY) / 2;

        context02.font = "14pt sans-serif";
        context02.fillStyle = "black";
        context02.textAlign = "left";

        var x61 = x6;
        var y61 = y6 + 15;
        context02.fillText("\u03C3", x61+80, y61+5); //네모 오른쪽 노말
        context02.fillText("x", x61 + 90, y61 + 11);
        context02.fillText("'", x61 + 98, y61 + 10);

        var x7 = (x1 + x2) / 2;
        var y7 = (y1 + y2) / 2;

        var x8 = (3 * x7 - centreX) / 2;
        var y8 = (3 * y7 - centreY) / 2;
        var x81 = x8;
        var y81 = y8 + 15;
        context02.fillText("\u03C3", x81+80, y81-20); //네모 위쪽 노말
        context02.fillText("y", x81 + 90, y81 - 13);
        context02.fillText("'", x81 + 99, y81 - 12);

        var x9 = (x3 + x2) / 2;
        var y9 = (y3 + y2) / 2;

        var x10 = (3 * x9 - centreX) / 2;
        var y10 = (3 * y9 - centreY) / 2;

        var x101 = x10;
        var y101 = y10 + 15;
        context02.fillText("\u03C3", x101+80, y101+10); //네모 왼쪽 노말
        context02.fillText("x", x101 + 90, y101 + 16);
        context02.fillText("'", x101 + 98, y101 + 17);

        var x11 = (x3 + x4) / 2;
        var y11 = (y3 + y4) / 2;

        var x12 = (3 * x11 - centreX) / 2;
        var y12 = (3 * y11 - centreY) / 2;

        var x121 = x12;
        var y121 = y12 + 15;
        context02.fillText("\u03C3", x121+80, y121); // 네모 아래쪽 노말
        context02.fillText("y", x121 + 90, y121 + 6);
        context02.fillText("'", x121 + 99, y121 + 7);

        // For the shear stress components
        var x13 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.29);
        var y13 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.29);
        var x14 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.71);
        var y14 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.71);

        var x15 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.79);
        var y15 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.79);
        var x16 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.21);
        var y16 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.21);

        var x17 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.29);
        var y17 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.29);
        var x18 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.71);
        var y18 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.71);

        var x19 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.79);
        var y19 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.79);
        var x20 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.21);
        var y20 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.21);

        var x131 = x13 - 10;
        var y131 = y13 - 10;
        context02.fillText("\u03C4", x131+115, y131);
        context02.fillText("x", x131 + 135, y131 + 6);
        context02.fillText("'", x131 + 143, y131 + 7);
        context02.fillText("y", x131 + 147, y131 + 6);
        context02.fillText("'", x131 + 156, y131 + 7);

        var x171 = x17 - 20;
        var y171 = y17 + 20;
        context02.fillText("\u03C4", x171+50, y171);
        context02.fillText("x", x171 +60, y171 + 6);
        context02.fillText("'", x171 +68, y171 + 7);
        context02.fillText("y", x171 +72, y171 + 6);
        context02.fillText("'", x171 +81, y171 + 7);


        context02.beginPath();
        context02.moveTo(x5+80, y5);
        context02.lineTo(x6+80, y6);
        context02.moveTo(x7+80, y7);
        context02.lineTo(x8+80, y8);
        context02.moveTo(x9+80, y9);
        context02.lineTo(x10+80, y10);
        context02.moveTo(x11+80, y11);
        context02.lineTo(x12+80, y12);

        context02.moveTo(x13+80, y13);
        context02.lineTo(x14+80, y14);
        context02.moveTo(x15+80, y15);
        context02.lineTo(x16+80, y16);
        context02.moveTo(x17+80, y17);
        context02.lineTo(x18+80, y18);
        context02.moveTo(x19+80, y19);
        context02.lineTo(x20+80, y20);
        context02.stroke();

        // For the arrow marks 왼쪽그림에서의 화살표들
        drawArrow(context02, x5+80, y5, x6+80, y6);
        drawArrow(context02, x7+80, y7, x8+80, y8);
        drawArrow(context02, x9+80, y9, x10+80, y10);
        drawArrow(context02, x11+80, y11, x12+80, y12);
        drawArrow(context02, x14+80, y14, x13+80, y13);
        drawArrow(context02, x15+80, y15, x16+80, y16);
        drawArrow(context02, x18+80, y18, x17+80, y17);
        drawArrow(context02, x19+80, y19, x20+80, y20);

        // Draw the axes
        var lengthOfSegment = 30;
        context02.beginPath();
        context02.strokeStyle = "red";
        context02.moveTo(centreX+80, centreY);
        context02.lineTo(centreX + lengthOfSegment+80, centreY);
        context02.moveTo(centreX+80, centreY - lengthOfSegment);
        context02.lineTo(centreX+80, centreY);
        context02.stroke();

        var x30 = centreX;
        var y30 = centreY;
        var x31 = centreX + lengthOfSegment;
        var y31 = centreY;
        var x32 = centreX;
        var y32 = centreY ;
        var x33 = centreX;
        var y33 = centreY - lengthOfSegment;

        drawArrow(context02, x30+80, y30, x31+80, y31); //왼쪽그림에서 가운에 있는 화살표들 중 고정
        drawArrow(context02, x32+80, y32, x33+80, y33);

        context02.font = "12pt sans-serif";
        context02.fillStyle = "RED";
        context02.strokeStyle = "#000000";
        context02.textAlign = "left";

        context02.fillText('x', centreX +87 + lengthOfSegment, centreY + 4);
        context02.fillText('y', centreX +77, centreY - lengthOfSegment + -10);

        // Draw the rotating axes
        var x56 = centreX + lengthOfSegment * Math.cos(angle);
        var y56 = centreY - lengthOfSegment * Math.sin(angle);
        var x78 = centreX + lengthOfSegment * Math.cos(angle + 1.57);
        var y78 = centreY - lengthOfSegment * Math.sin(angle + 1.57);


        drawArrow(context02, centreX+80, centreY, x56+80, y56); //왼쪽그림의 화살표 중 움직이는것
        drawArrow(context02, centreX+80, centreY, x78+80, y78);

        context02.font = "12pt sans-serif";
        context02.fillStyle = "BLACK";
        context02.textAlign = "left";
        context02.fillText('x', x56+87, y56 + 4);
        context02.fillText('y', x78+77, y78 - 10);
        context02.fillText("'", x56 + 95, y56 + 5);
        context02.fillText("'", x78 + 85, y78 -9);

        context02.font = "15pt sans-serif";
        context02.fillText("Rotated Element by Input", 5, 20);

        context02.restore();

        drawSecondaryStressesText(context02);
    }

    // Draw the text of the Secondary Stresses on the bottom canvas
    function drawSecondaryStressesText(context) {
        context.save();
        var xTextMargin1 = canvas02.width - 160;
        context.beginPath();
        context.font = "13pt Dialog";
        context.fillStyle = "black";
        context.textAlign = "left";

        context.fillText("\u03B8", xTextMargin1, 25);
        var text1 = ' = ' + angleDegrees  + ' °';
        context.fillText(text1, xTextMargin1 + 25, 25);

        context.fillText("\u03C3", xTextMargin1, 55);
        context.fillText("x", xTextMargin1 + 10, 61);
        context.fillText("'", xTextMargin1 + 18, 62);
        var text1 = ' = ' + sigmax1.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 25, 55);

        context.fillText("\u03C3", xTextMargin1, 88);
        context.fillText("y", xTextMargin1 + 10, 94);
        context.fillText("'", xTextMargin1 + 18, 95);
        text1 = ' = ' + sigmay1.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 25, 88);

        context.fillText("\u03C4", xTextMargin1, 122);
        context.fillText("x", xTextMargin1 + 10, 128);
        context.fillText("'", xTextMargin1 + 18, 129);
        context.fillText("y", xTextMargin1 + 23, 128);
        context.fillText("'", xTextMargin1 + 31, 129);
        text1 = ' = ' + taux1y1.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 36, 122);
        context.stroke();
        context.restore();
    }

    // Input angle is in degrees
    function computeSecondaryStresses(angle)
    {
        var angleRadians = angle * Math.PI / 180.0;
        var sinVal = Math.sin(2.0 * angleRadians);
        var cosVal = Math.cos(2.0 * angleRadians);
        var term1 = (sigmax + sigmay) * 0.5;
        var term2 = (sigmax - sigmay) * 0.5 * cosVal;
        var term3 = tauxy * sinVal;
        sigmax1 = term1 + term2 + term3;
        sigmay1 = term1 - term2 - term3;
        var term4 = (sigmax - sigmay) * 0.5 * sinVal;
        var term5 = tauxy * cosVal;
        taux1y1 = - term4 + term5;
    }
    function drawSecondaryStressesTextMaxPrincipal(context) {
        context.save();
        var xTextMargin1 = canvas02.width - 160;
        context.beginPath();
        context.font = "13pt Dialog";
        context.fillStyle = "black";
        context.textAlign = "left";

        context.fillText("\u03B8", xTextMargin1, 25);
        var text1 = ' = ' + angleDegreesP  + ' °';
        context.fillText(text1, xTextMargin1 + 25, 25);

        context.fillText("\u03C3", xTextMargin1, 55);
        context.fillText("x", xTextMargin1 + 10, 61);
        context.fillText("'", xTextMargin1 + 18, 62);
        var text1 = ' = ' + sigmax1P.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 25, 55);

        context.fillText("\u03C3", xTextMargin1, 88);
        context.fillText("y", xTextMargin1 + 10, 94);
        context.fillText("'", xTextMargin1 + 18, 95);
        text1 = ' = ' + sigmay1P.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 25, 88);

        context.fillText("\u03C4", xTextMargin1, 122);
        context.fillText("x", xTextMargin1 + 10, 128);
        context.fillText("'", xTextMargin1 + 18, 129);
        context.fillText("y", xTextMargin1 + 23, 128);
        context.fillText("'", xTextMargin1 + 31, 129);
        text1 = ' = ' + taux1y1P.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 36, 122);
        context.stroke();
        context.restore();
    }
    function computeSecondaryStressesMaxPrincipal(maxPrincipalAngle)
    {
        var angleRadians = maxPrincipalAngle * Math.PI / 180.0;
        var sinVal = Math.sin(2.0 * angleRadians);
        var cosVal = Math.cos(2.0 * angleRadians);
        var term1 = (sigmax + sigmay) * 0.5;
        var term2 = (sigmax - sigmay) * 0.5 * cosVal;
        var term3 = tauxy * sinVal;
        sigmax1P = term1 + term2 + term3;
        sigmay1P = term1 - term2 - term3;
        var term4 = (sigmax - sigmay) * 0.5 * sinVal;
        var term5 = tauxy * cosVal;
        taux1y1P = - term4 + term5;
    }
    function drawRotatingSquareMaxPrincipal()
    {
      //var angleValue = document.getElementById('raAngle').value;
      //angle = parseFloat(angleValue);
      //angle = angle * Math.PI / 180.0;
      angle = maxPrincipalAngle * Math.PI / 180.0;

      context03.save();

      var radius = 180;
      var radiusShear = 182;
      var x1, y1, x2, y2, x3, y4, x4, y4;
      var centreX = 200;
      var centreY = canvas03.height / 2;
      x1 = centreX + radius * Math.cos(angle + Math.PI * 0.25);
      y1 = centreY - radius * Math.sin(angle + Math.PI * 0.25);
      x2 = centreX + radius * Math.cos(angle + Math.PI * 0.75);
      y2 = centreY - radius * Math.sin(angle + Math.PI * 0.75);
      x3 = centreX + radius * Math.cos(angle + Math.PI * 1.25);
      y3 = centreY - radius * Math.sin(angle + Math.PI * 1.25);
      x4 = centreX + radius * Math.cos(angle + Math.PI * 1.75);
      y4 = centreY - radius * Math.sin(angle + Math.PI * 1.75);

      context03.beginPath();
      context03.fillStyle = 'white'; // 네모밖의 네모
      context03.fillRect(0, 0, canvas03.width, canvas03.height);
      context03.lineWidth = 2;
      context03.moveTo(x1+80, y1); // Point 1
      context03.lineTo(x2+80, y2); // Point 2
      context03.lineTo(x3+80, y3); // Point 3
      context03.lineTo(x4+80, y4); // Point 4
      context03.lineTo(x1+80, y1); // Point 1
      context03.stroke();

      // For the normal stress components
      var x5 = (x1 + x4) / 2;
      var y5 = (y1 + y4) / 2;

      var x6 = (3 * x5 - centreX) / 2;
      var y6 = (3 * y5 - centreY) / 2;

      context03.font = "14pt sans-serif";
      context03.fillStyle = "black";
      context03.textAlign = "left";

      var x61 = x6;
      var y61 = y6 + 15;
      context03.fillText("\u03C3", x61+80, y61+5); //네모 오른쪽 노말
      context03.fillText("x", x61 + 90, y61 + 11);
      context03.fillText("'", x61 + 98, y61 + 10);

      var x7 = (x1 + x2) / 2;
      var y7 = (y1 + y2) / 2;

      var x8 = (3 * x7 - centreX) / 2;
      var y8 = (3 * y7 - centreY) / 2;
      var x81 = x8;
      var y81 = y8 + 15;
      context03.fillText("\u03C3", x81+80, y81-20); //네모 위쪽 노말
      context03.fillText("y", x81 + 90, y81 - 13);
      context03.fillText("'", x81 + 99, y81 - 12);

      var x9 = (x3 + x2) / 2;
      var y9 = (y3 + y2) / 2;

      var x10 = (3 * x9 - centreX) / 2;
      var y10 = (3 * y9 - centreY) / 2;

      var x101 = x10;
      var y101 = y10 + 15;
      context03.fillText("\u03C3", x101+80, y101+10); //네모 왼쪽 노말
      context03.fillText("x", x101 + 90, y101 + 16);
      context03.fillText("'", x101 + 98, y101 + 17);

      var x11 = (x3 + x4) / 2;
      var y11 = (y3 + y4) / 2;

      var x12 = (3 * x11 - centreX) / 2;
      var y12 = (3 * y11 - centreY) / 2;

      var x121 = x12;
      var y121 = y12 + 15;
      context03.fillText("\u03C3", x121+80, y121); // 네모 아래쪽 노말
      context03.fillText("y", x121 + 90, y121 + 6);
      context03.fillText("'", x121 + 99, y121 + 7);

      // For the shear stress components
      var x13 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.29);
      var y13 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.29);
      var x14 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.71);
      var y14 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.71);

      var x15 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.79);
      var y15 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.79);
      var x16 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.21);
      var y16 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.21);

      var x17 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.29);
      var y17 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.29);
      var x18 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.71);
      var y18 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.71);

      var x19 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.79);
      var y19 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.79);
      var x20 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.21);
      var y20 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.21);

      var x131 = x13 - 10;
      var y131 = y13 - 10;
      context03.fillText("\u03C4", x131+115, y131);
      context03.fillText("x", x131 + 135, y131 + 6);
      context03.fillText("'", x131 + 143, y131 + 7);
      context03.fillText("y", x131 + 147, y131 + 6);
      context03.fillText("'", x131 + 156, y131 + 7);

      var x171 = x17 - 20;
      var y171 = y17 + 20;
      context03.fillText("\u03C4", x171+50, y171);
      context03.fillText("x", x171 +60, y171 + 6);
      context03.fillText("'", x171 +68, y171 + 7);
      context03.fillText("y", x171 +72, y171 + 6);
      context03.fillText("'", x171 +81, y171 + 7);


      context03.beginPath();
      context03.moveTo(x5+80, y5);
      context03.lineTo(x6+80, y6);
      context03.moveTo(x7+80, y7);
      context03.lineTo(x8+80, y8);
      context03.moveTo(x9+80, y9);
      context03.lineTo(x10+80, y10);
      context03.moveTo(x11+80, y11);
      context03.lineTo(x12+80, y12);

      context03.moveTo(x13+80, y13);
      context03.lineTo(x14+80, y14);
      context03.moveTo(x15+80, y15);
      context03.lineTo(x16+80, y16);
      context03.moveTo(x17+80, y17);
      context03.lineTo(x18+80, y18);
      context03.moveTo(x19+80, y19);
      context03.lineTo(x20+80, y20);
      context03.stroke();

      // For the arrow marks 왼쪽그림에서의 화살표들
      drawArrow(context03, x5+80, y5, x6+80, y6);
      drawArrow(context03, x7+80, y7, x8+80, y8);
      drawArrow(context03, x9+80, y9, x10+80, y10);
      drawArrow(context03, x11+80, y11, x12+80, y12);
      drawArrow(context03, x14+80, y14, x13+80, y13);
      drawArrow(context03, x15+80, y15, x16+80, y16);
      drawArrow(context03, x18+80, y18, x17+80, y17);
      drawArrow(context03, x19+80, y19, x20+80, y20);

      // Draw the axes
      var lengthOfSegment = 30;
      context03.beginPath();
      context03.strokeStyle = "red";
      context03.moveTo(centreX+80, centreY);
      context03.lineTo(centreX + lengthOfSegment+80, centreY);
      context03.moveTo(centreX+80, centreY - lengthOfSegment);
      context03.lineTo(centreX+80, centreY);
      context03.stroke();

      var x30 = centreX;
      var y30 = centreY;
      var x31 = centreX + lengthOfSegment;
      var y31 = centreY;
      var x32 = centreX;
      var y32 = centreY ;
      var x33 = centreX;
      var y33 = centreY - lengthOfSegment;

      drawArrow(context03, x30+80, y30, x31+80, y31); //왼쪽그림에서 가운에 있는 화살표들 중 고정
      drawArrow(context03, x32+80, y32, x33+80, y33);

      context03.font = "12pt sans-serif";
      context03.fillStyle = "RED";
      context03.strokeStyle = "#000000";
      context03.textAlign = "left";

      context03.fillText('x', centreX +87 + lengthOfSegment, centreY + 4);
      context03.fillText('y', centreX +77, centreY - lengthOfSegment + -10);

      // Draw the rotating axes
      var x56 = centreX + lengthOfSegment * Math.cos(angle);
      var y56 = centreY - lengthOfSegment * Math.sin(angle);
      var x78 = centreX + lengthOfSegment * Math.cos(angle + 1.57);
      var y78 = centreY - lengthOfSegment * Math.sin(angle + 1.57);


      drawArrow(context03, centreX+80, centreY, x56+80, y56); //왼쪽그림의 화살표 중 움직이는것
      drawArrow(context03, centreX+80, centreY, x78+80, y78);

      context03.font = "12pt sans-serif";
      context03.fillStyle = "BLACK";
      context03.textAlign = "left";
      context03.fillText('x', x56+87, y56 + 4);
      context03.fillText('y', x78+77, y78 - 10);
      context03.fillText("'", x56 + 95, y56 + 5);
      context03.fillText("'", x78 + 85, y78 -9);

      context03.font = "15pt sans-serif";
      context03.fillText("Element In Principal Stress", 5, 20);

      context03.restore();

      drawSecondaryStressesTextMaxPrincipal(context03);
    }
    // maximum shear stress condition
    function drawSecondaryStressesTextMaxShear(context) {
        context.save();
        var xTextMargin1 = canvas04.width - 160;
        context.beginPath();
        context.font = "13pt Dialog";
        context.fillStyle = "black";
        context.textAlign = "left";

        context.fillText("\u03B8", xTextMargin1, 25);
        var text1 = ' = ' + maxShearAngle.toFixed(2)  + ' °';
        context.fillText(text1, xTextMargin1 + 25, 25);

        context.fillText("\u03C3", xTextMargin1, 55);
        context.fillText("x", xTextMargin1 + 10, 61);
        context.fillText("'", xTextMargin1 + 18, 62);
        var text1 = ' = ' + sigmax1P.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 25, 55);

        context.fillText("\u03C3", xTextMargin1, 88);
        context.fillText("y", xTextMargin1 + 10, 94);
        context.fillText("'", xTextMargin1 + 18, 95);
        text1 = ' = ' + sigmay1P.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 25, 88);

        context.fillText("\u03C4", xTextMargin1, 122);
        context.fillText("x", xTextMargin1 + 10, 128);
        context.fillText("'", xTextMargin1 + 18, 129);
        context.fillText("y", xTextMargin1 + 23, 128);
        context.fillText("'", xTextMargin1 + 31, 129);
        text1 = ' = ' + taux1y1P.toFixed(2)  + ' MPa';
        context.fillText(text1, xTextMargin1 + 36, 122);
        context.stroke();
        context.restore();
    }
    function computeSecondaryStressesMaxShear(maxShearAngle)
    {
        var angleRadians = maxShearAngle * Math.PI / 180.0;
        var sinVal = Math.sin(2.0 * angleRadians);
        var cosVal = Math.cos(2.0 * angleRadians);
        var term1 = (sigmax + sigmay) * 0.5;
        var term2 = (sigmax - sigmay) * 0.5 * cosVal;
        var term3 = tauxy * sinVal;
        sigmax1P = term1 + term2 + term3;
        sigmay1P = term1 - term2 - term3;
        var term4 = (sigmax - sigmay) * 0.5 * sinVal;
        var term5 = tauxy * cosVal;
        taux1y1P = - term4 + term5;
    }
    function drawRotatingSquareMaxShear()
    {
      //var angleValue = document.getElementById('raAngle').value;
      //angle = parseFloat(angleValue);
      //angle = angle * Math.PI / 180.0;
      angle = maxShearAngle * Math.PI / 180.0;

      context04.save();

      var radius = 180;
      var radiusShear = 182;
      var x1, y1, x2, y2, x3, y4, x4, y4;
      var centreX = 200;
      var centreY = canvas04.height / 2;
      x1 = centreX + radius * Math.cos(angle + Math.PI * 0.25);
      y1 = centreY - radius * Math.sin(angle + Math.PI * 0.25);
      x2 = centreX + radius * Math.cos(angle + Math.PI * 0.75);
      y2 = centreY - radius * Math.sin(angle + Math.PI * 0.75);
      x3 = centreX + radius * Math.cos(angle + Math.PI * 1.25);
      y3 = centreY - radius * Math.sin(angle + Math.PI * 1.25);
      x4 = centreX + radius * Math.cos(angle + Math.PI * 1.75);
      y4 = centreY - radius * Math.sin(angle + Math.PI * 1.75);

      context04.beginPath();
      context04.fillStyle = 'white'; // 네모밖의 네모
      context04.fillRect(0, 0, canvas04.width, canvas04.height);
      context04.lineWidth = 2;
      context04.moveTo(x1+80, y1); // Point 1
      context04.lineTo(x2+80, y2); // Point 2
      context04.lineTo(x3+80, y3); // Point 3
      context04.lineTo(x4+80, y4); // Point 4
      context04.lineTo(x1+80, y1); // Point 1
      context04.stroke();

      // For the normal stress components
      var x5 = (x1 + x4) / 2;
      var y5 = (y1 + y4) / 2;

      var x6 = (3 * x5 - centreX) / 2;
      var y6 = (3 * y5 - centreY) / 2;

      context04.font = "14pt sans-serif";
      context04.fillStyle = "black";
      context04.textAlign = "left";

      var x61 = x6;
      var y61 = y6 + 15;
      context04.fillText("\u03C3", x61+80, y61+5); //네모 오른쪽 노말
      context04.fillText("x", x61 + 90, y61 + 11);
      context04.fillText("'", x61 + 98, y61 + 10);

      var x7 = (x1 + x2) / 2;
      var y7 = (y1 + y2) / 2;

      var x8 = (3 * x7 - centreX) / 2;
      var y8 = (3 * y7 - centreY) / 2;
      var x81 = x8;
      var y81 = y8 + 15;
      context04.fillText("\u03C3", x81+80, y81-20); //네모 위쪽 노말
      context04.fillText("y", x81 + 90, y81 - 13);
      context04.fillText("'", x81 + 99, y81 - 12);

      var x9 = (x3 + x2) / 2;
      var y9 = (y3 + y2) / 2;

      var x10 = (3 * x9 - centreX) / 2;
      var y10 = (3 * y9 - centreY) / 2;

      var x101 = x10;
      var y101 = y10 + 15;
      context04.fillText("\u03C3", x101+80, y101+10); //네모 왼쪽 노말
      context04.fillText("x", x101 + 90, y101 + 16);
      context04.fillText("'", x101 + 98, y101 + 17);

      var x11 = (x3 + x4) / 2;
      var y11 = (y3 + y4) / 2;

      var x12 = (3 * x11 - centreX) / 2;
      var y12 = (3 * y11 - centreY) / 2;

      var x121 = x12;
      var y121 = y12 + 15;
      context04.fillText("\u03C3", x121+80, y121); // 네모 아래쪽 노말
      context04.fillText("y", x121 + 90, y121 + 6);
      context04.fillText("'", x121 + 99, y121 + 7);

      // For the shear stress components
      var x13 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.29);
      var y13 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.29);
      var x14 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.71);
      var y14 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.71);

      var x15 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.79);
      var y15 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.79);
      var x16 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.21);
      var y16 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.21);

      var x17 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.29);
      var y17 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.29);
      var x18 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.71);
      var y18 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.71);

      var x19 = centreX + radiusShear * Math.cos(angle + Math.PI * 1.79);
      var y19 = centreY - radiusShear * Math.sin(angle + Math.PI * 1.79);
      var x20 = centreX + radiusShear * Math.cos(angle + Math.PI * 0.21);
      var y20 = centreY - radiusShear * Math.sin(angle + Math.PI * 0.21);

      var x131 = x13 - 10;
      var y131 = y13 - 10;
      context04.fillText("\u03C4", x131+115, y131);
      context04.fillText("x", x131 + 135, y131 + 6);
      context04.fillText("'", x131 + 143, y131 + 7);
      context04.fillText("y", x131 + 147, y131 + 6);
      context04.fillText("'", x131 + 156, y131 + 7);

      var x171 = x17 - 20;
      var y171 = y17 + 20;
      context04.fillText("\u03C4", x171+50, y171);
      context04.fillText("x", x171 +60, y171 + 6);
      context04.fillText("'", x171 +68, y171 + 7);
      context04.fillText("y", x171 +72, y171 + 6);
      context04.fillText("'", x171 +81, y171 + 7);


      context04.beginPath();
      context04.moveTo(x5+80, y5);
      context04.lineTo(x6+80, y6);
      context04.moveTo(x7+80, y7);
      context04.lineTo(x8+80, y8);
      context04.moveTo(x9+80, y9);
      context04.lineTo(x10+80, y10);
      context04.moveTo(x11+80, y11);
      context04.lineTo(x12+80, y12);

      context04.moveTo(x13+80, y13);
      context04.lineTo(x14+80, y14);
      context04.moveTo(x15+80, y15);
      context04.lineTo(x16+80, y16);
      context04.moveTo(x17+80, y17);
      context04.lineTo(x18+80, y18);
      context04.moveTo(x19+80, y19);
      context04.lineTo(x20+80, y20);
      context04.stroke();

      // For the arrow marks 왼쪽그림에서의 화살표들
      drawArrow(context04, x5+80, y5, x6+80, y6);
      drawArrow(context04, x7+80, y7, x8+80, y8);
      drawArrow(context04, x9+80, y9, x10+80, y10);
      drawArrow(context04, x11+80, y11, x12+80, y12);
      drawArrow(context04, x14+80, y14, x13+80, y13);
      drawArrow(context04, x15+80, y15, x16+80, y16);
      drawArrow(context04, x18+80, y18, x17+80, y17);
      drawArrow(context04, x19+80, y19, x20+80, y20);

      // Draw the axes
      var lengthOfSegment = 30;
      context04.beginPath();
      context04.strokeStyle = "red";
      context04.moveTo(centreX+80, centreY);
      context04.lineTo(centreX + lengthOfSegment+80, centreY);
      context04.moveTo(centreX+80, centreY - lengthOfSegment);
      context04.lineTo(centreX+80, centreY);
      context04.stroke();

      var x30 = centreX;
      var y30 = centreY;
      var x31 = centreX + lengthOfSegment;
      var y31 = centreY;
      var x32 = centreX;
      var y32 = centreY ;
      var x33 = centreX;
      var y33 = centreY - lengthOfSegment;

      drawArrow(context04, x30+80, y30, x31+80, y31); //왼쪽그림에서 가운에 있는 화살표들 중 고정
      drawArrow(context04, x32+80, y32, x33+80, y33);

      context04.font = "12pt sans-serif";
      context04.fillStyle = "RED";
      context04.strokeStyle = "#000000";
      context04.textAlign = "left";

      context04.fillText('x', centreX +87 + lengthOfSegment, centreY + 4);
      context04.fillText('y', centreX +77, centreY - lengthOfSegment + -10);

      // Draw the rotating axes
      var x56 = centreX + lengthOfSegment * Math.cos(angle);
      var y56 = centreY - lengthOfSegment * Math.sin(angle);
      var x78 = centreX + lengthOfSegment * Math.cos(angle + 1.57);
      var y78 = centreY - lengthOfSegment * Math.sin(angle + 1.57);


      drawArrow(context04, centreX+80, centreY, x56+80, y56); //왼쪽그림의 화살표 중 움직이는것
      drawArrow(context04, centreX+80, centreY, x78+80, y78);

      context04.font = "12pt sans-serif";
      context04.fillStyle = "BLACK";
      context04.textAlign = "left";
      context04.fillText('x', x56+87, y56 + 4);
      context04.fillText('y', x78+77, y78 - 10);
      context04.fillText("'", x56 + 95, y56 + 5);
      context04.fillText("'", x78 + 85, y78 -9);

      context04.font = "15pt sans-serif";
      context04.fillText("Element In Max Shear Stress", 5, 20);

      context04.restore();

      drawSecondaryStressesTextMaxShear(context04);
    }
    // Event handler for angle change
    function angleChange() {
        var angleValue = document.getElementById('raAngle').value;
        var angl = parseFloat(angleValue);
        var angl2 = angl.toFixed(2);
        angleDegrees = angl2;
        document.getElementById('opAngle').textContent = ' °',

        computeSecondaryStresses(angl);
        drawRotatingSquare();
        computeSecondaryStressesMaxPrincipal(maxPrincipalAngle);
        drawRotatingSquareMaxPrincipal();
        computeSecondaryStressesMaxShear(maxShearAngle);
        drawRotatingSquareMaxShear();
        drawMohrsCircle();
    }
}());
