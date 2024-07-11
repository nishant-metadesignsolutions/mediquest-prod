
import '../assets2/css/main.min.css';
import '../assets2/css/external.css';
import './StyledText.css';

// const StyledText = ({ htmlContent, className }) => {
//   const combinedClassName = className ? `styled-text ${className}` : 'styled-text';
//   return <div className={combinedClassName} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
// };

// export default StyledText;


const StyledText = ({ htmlContent, className }) => {
  const combinedClassName = className ? `styled-text ${className}` : 'styled-text';

  // Function to remove <br> tags inside <p> tags
  const removeBrTagsInP = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    tempDiv.querySelectorAll('p > br').forEach((br) => {
      br.parentNode.removeChild(br);
    });
    return tempDiv.innerHTML;
  };

  const sanitizedHtmlContent = removeBrTagsInP(htmlContent);

  return <div className={combinedClassName} dangerouslySetInnerHTML={{ __html: sanitizedHtmlContent }} />;
};

export default StyledText;