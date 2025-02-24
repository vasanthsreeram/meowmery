'use client';

export default function AnimatedCat() {
  return (
    <div className="cat-animation">
      <style jsx>{`
        .cat-animation {
          --pink: #fd6e72;
          --purple: #745260;
          --teal: #abe7db;
          --cream: #fdf9de;
          position: relative;
          width: 110px;
          height: 50px;
        }

        .cat {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .body {
          width: 110px;
          height: 50px;
          background-color: var(--purple);
          position: absolute;
          border-top-left-radius: 100px;
          border-top-right-radius: 100px;
          animation: bodyAnim 3s infinite;
        }

        .head {
          width: 70px;
          height: 35px;
          background-color: var(--purple);
          position: absolute;
          top: 20px;
          left: -40px;
          border-top-left-radius: 80px;
          border-top-right-radius: 80px;
        }

        .tail {
          position: absolute;
          width: 20px;
          height: 15px;
          background-color: var(--purple);
          right: -10px;
          bottom: -8px;
          border-radius: 5px;
          animation: tailAnim 3s infinite;
          transform-origin: left;
        }

        .ear {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 12px solid transparent;
          border-right: 12px solid transparent;
          border-bottom: 20px solid var(--purple);
        }

        .ear-left {
          top: -4px;
          left: 4px;
          transform: rotate(-30deg);
          animation: earLeftAnim 3s infinite;
        }

        .ear-right {
          top: -12px;
          left: 30px;
          transform: rotate(-15deg);
          animation: earRightAnim 3s infinite;
        }

        .nose {
          position: absolute;
          bottom: 10px;
          left: -10px;
          background-color: var(--pink);
          height: 5px;
          width: 5px;
          border-radius: 50%;
        }

        .whisker {
          position: absolute;
          height: 1px;
          width: 20px;
          background-color: var(--cream);
        }

        .whiskers-left {
          bottom: 8px;
          left: -36px;
          transform: rotate(10deg);
        }

        .whiskers-right {
          bottom: 8px;
          left: -36px;
          transform: rotate(-10deg);
        }

        @keyframes bodyAnim {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.1); }
        }

        @keyframes tailAnim {
          0%, 100% { transform: rotate(0); }
          50% { transform: rotate(30deg); }
        }

        @keyframes earLeftAnim {
          0%, 100% { transform: rotate(-30deg); }
          50% { transform: rotate(-20deg); }
        }

        @keyframes earRightAnim {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(-25deg); }
        }
      `}</style>

      <div className="cat">
        <div className="body">
          <div className="head">
            <div className="ear ear-left"></div>
            <div className="ear ear-right"></div>
            <div className="nose"></div>
            <div className="whisker whiskers-left"></div>
            <div className="whisker whiskers-right"></div>
          </div>
          <div className="tail"></div>
        </div>
      </div>
    </div>
  );
} 